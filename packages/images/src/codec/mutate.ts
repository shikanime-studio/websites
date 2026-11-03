import type { Analysis, Endian, Field } from "./analysis";
import { Data } from "effect";
import { fieldWidth } from "./analysis";

/**
 * A value change the UI asks for; it never carries bytes.
 *
 * A tagged enum rather than a hand-written union: the constructors and `$is`
 * guards come with the type, so a new variant cannot be added without every
 * match site seeing it.
 */
export type Mutation = Data.TaggedEnum<{
  number: { readonly id: string; readonly value: number };
  ascii: { readonly id: string; readonly value: string };
}>;

// The constructor and the type share a name on purpose — that merging is the
// documented Effect pattern, so `Mutation.number(...)` constructs `Mutation`.
// eslint-disable-next-line ts/no-redeclare
export const Mutation = Data.taggedEnum<Mutation>();

/** One range to overwrite. Same length as the bytes it replaces. */
export interface Write {
  readonly offset: number;
  readonly bytes: Uint8Array;
}

export interface Planned {
  /** Unchanged when the write fits the reserved bytes — referentially equal. */
  readonly analysis: Analysis;
  readonly writes: readonly Write[];
}

export interface Relocated {
  /** Offsets already shifted for the cut and the insert. */
  readonly analysis: Analysis;
  /** The old reservation, cut out of the original layout. */
  readonly removed: { readonly at: number; readonly length: number };
  /** The grown value, appended at its segment's end (original layout). */
  readonly inserted: { readonly at: number; readonly bytes: Uint8Array };
  /** Length fields and other in-place patches, addressed in the new layout. */
  readonly writes: readonly Write[];
}

export type Plan = Data.TaggedEnum<{
  ok: { readonly planned: Planned };
  relocated: { readonly relocated: Relocated };
  unknownField: { readonly id: string };
  outOfRange: { readonly id: string; readonly value: number };
  /** The value is longer than the bytes reserved for it: relocate, never truncate. */
  needsRelocation: { readonly id: string; readonly required: number };
}>;

// eslint-disable-next-line ts/no-redeclare
export const Plan = Data.taggedEnum<Plan>();

function encodeNumber(
  kind: Field["kind"],
  endian: Endian,
  value: number,
): Uint8Array | null {
  const width = fieldWidth(kind);
  if (width === 0 || !Number.isInteger(value)) return null;

  const bytes = new Uint8Array(width);
  const view = new DataView(bytes.buffer);
  const le = endian === "le";

  switch (kind) {
    case "u8":
      if (value < 0 || value > 0xFF) return null;
      view.setUint8(0, value);
      return bytes;
    case "u16":
      if (value < 0 || value > 0xFFFF) return null;
      view.setUint16(0, value, le);
      return bytes;
    case "u32":
      if (value < 0 || value > 0xFFFFFFFF) return null;
      view.setUint32(0, value, le);
      return bytes;
    case "i32":
      if (value < -0x80000000 || value > 0x7FFFFFFF) return null;
      view.setInt32(0, value, le);
      return bytes;
    default:
      return null;
  }
}

function encodeAscii(value: string, reserved: number): Uint8Array | null {
  const encoded = new TextEncoder().encode(value);
  // One byte must stay for the terminator, like the EXIF ASCII convention.
  if (encoded.length + 1 > reserved) return null;
  const bytes = new Uint8Array(reserved);
  bytes.set(encoded);
  return bytes;
}

/**
 * Turn a mutation into the exact bytes to write, without touching them.
 *
 * Pure: same analysis and mutation always produce the same plan, which makes
 * the expensive part (parsing offsets) reusable and the cheap part (applying a
 * plan) trivially testable.
 */
export function plan(analysis: Analysis, mutation: Mutation): Plan {
  const field = analysis.fields.get(mutation.id);
  if (!field) return Plan.unknownField({ id: mutation.id });

  if (Mutation.$is("number")(mutation)) {
    const bytes = encodeNumber(field.kind, field.endian, mutation.value);
    if (!bytes) {
      return Plan.outOfRange({ id: field.id, value: mutation.value });
    }
    return Plan.ok({
      planned: { analysis, writes: [{ offset: field.offset, bytes }] },
    });
  }

  const bytes = encodeAscii(mutation.value, field.reserved);
  if (!bytes) {
    const required = new TextEncoder().encode(mutation.value).length + 1;
    return relocate(analysis, field, mutation.value, required);
  }
  return Plan.ok({
    planned: { analysis, writes: [{ offset: field.offset, bytes }] },
  });
}

/** Apply a plan to the caller's buffer. The analysis is never mutated. */
export function apply(view: DataView, planned: Planned): DataView {
  for (const write of planned.writes) {
    if (write.offset + write.bytes.byteLength > view.byteLength) {
      throw new RangeError(`write at ${write.offset} exceeds ${view.byteLength} bytes`);
    }
    new Uint8Array(
      view.buffer,
      view.byteOffset + write.offset,
      write.bytes.byteLength,
    ).set(write.bytes);
  }
  return view;
}

/** Read one field through its descriptor, with no per-format branching. */
export function read(
  view: DataView,
  analysis: Analysis,
  id: string,
): number | string | null {
  const field = analysis.fields.get(id);
  if (!field) return null;
  const le = field.endian === "le";

  switch (field.kind) {
    case "u8":
      return view.getUint8(field.offset);
    case "u16":
      return view.getUint16(field.offset, le);
    case "u32":
      return view.getUint32(field.offset, le);
    case "i32":
      return view.getInt32(field.offset, le);
    case "ascii": {
      const bytes = new Uint8Array(
        view.buffer,
        view.byteOffset + field.offset,
        field.reserved,
      );
      const end = bytes.indexOf(0);
      return new TextDecoder().decode(
        end === -1 ? bytes : bytes.subarray(0, end),
      );
    }
  }
}

/** Shift every offset at or after `at`, and grow the segment containing it. */
function shift(analysis: Analysis, at: number, delta: number): Analysis {
  const fields = new Map<string, Field>();
  for (const field of analysis.fields.values()) {
    fields.set(field.id, {
      ...field,
      offset: field.offset >= at ? field.offset + delta : field.offset,
    });
  }
  const segments = analysis.segments.map((segment) => {
    if (segment.start >= at) {
      return { ...segment, start: segment.start + delta };
    }
    const end = segment.start + segment.length;
    // An insertion at the segment's end grows it; one past it leaves it alone.
    return end >= at ? { ...segment, length: segment.length + delta } : segment;
  });
  return {
    ...analysis,
    byteLength: analysis.byteLength + delta,
    fields,
    segments,
  };
}

/**
 * Grow a value past its reservation: append it at the end of the segment that
 * owns it, shift what follows, and patch the segment's length field.
 *
 * A value with no owning segment, or a segment that cannot grow, is refused —
 * guessing a location would produce a file that parses and lies.
 */
function relocate(
  analysis: Analysis,
  field: Field,
  value: string,
  required: number,
): Plan {
  const segment = analysis.segments.find(
    (candidate) => candidate.id === field.segment,
  );
  if (!segment || !segment.growable) {
    return Plan.needsRelocation({ id: field.id, required });
  }

  const bytes = encodeAscii(value, required);
  if (!bytes) return Plan.needsRelocation({ id: field.id, required });

  // The old reservation is cut, so everything after it moves left before the
  // new value is appended at what is now the segment's end.
  const at = segment.start + segment.length;
  const removed = shift(analysis, field.offset + field.reserved, -field.reserved);
  const insertAt = at - field.reserved;
  const moved = shift(removed, insertAt, required);

  const fields = new Map(moved.fields);
  fields.set(field.id, { ...field, offset: insertAt, reserved: required });

  const writes: Write[] = [];
  if (segment.lengthField) {
    const lengthField = fields.get(segment.lengthField);
    if (lengthField) {
      const lengthBytes = encodeNumber(
        lengthField.kind,
        lengthField.endian,
        segment.length - field.reserved + required,
      );
      if (!lengthBytes) {
        return Plan.needsRelocation({ id: field.id, required });
      }
      writes.push({ offset: lengthField.offset, bytes: lengthBytes });
    }
  }

  return Plan.relocated({
    relocated: {
      analysis: { ...moved, fields },
      removed: { at: field.offset, length: field.reserved },
      inserted: { at, bytes },
      writes,
    },
  });
}

/** Build the file the relocation describes; the input view is left untouched. */
export function applyRelocation(
  view: DataView,
  relocated: Relocated,
): Uint8Array {
  const source = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const { removed, inserted } = relocated;
  const out = new Uint8Array(
    source.length - removed.length + inserted.bytes.length,
  );

  // prefix · (bytes between the cut and the append point) · new value · suffix
  out.set(source.subarray(0, removed.at), 0);
  const middle = source.subarray(
    removed.at + removed.length,
    inserted.at,
  );
  out.set(middle, removed.at);
  const insertAt = inserted.at - removed.length;
  out.set(inserted.bytes, insertAt);
  out.set(source.subarray(inserted.at), insertAt + inserted.bytes.length);

  for (const write of relocated.writes) {
    out.set(write.bytes, write.offset);
  }
  return out;
}
