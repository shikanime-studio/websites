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

export type Plan = Data.TaggedEnum<{
  ok: { readonly planned: Planned };
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
    return Plan.needsRelocation({
      id: field.id,
      required: new TextEncoder().encode(mutation.value).length + 1,
    });
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
