import type { Analysis, Endian, Field } from "./analysis";
import { fieldWidth } from "./analysis";

/** A value change the UI asks for; it never carries bytes. */
export type Mutation =
  | { readonly _tag: "number"; readonly id: string; readonly value: number }
  | { readonly _tag: "ascii"; readonly id: string; readonly value: string };

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

export type Plan =
  | { readonly _tag: "ok"; readonly planned: Planned }
  | { readonly _tag: "unknownField"; readonly id: string }
  | { readonly _tag: "outOfRange"; readonly id: string; readonly value: number }
  /** The value is longer than the bytes reserved for it: relocate, never truncate. */
  | { readonly _tag: "needsRelocation"; readonly id: string; readonly required: number };

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
      if (value < 0 || value > 0xff) return null;
      view.setUint8(0, value);
      return bytes;
    case "u16":
      if (value < 0 || value > 0xffff) return null;
      view.setUint16(0, value, le);
      return bytes;
    case "u32":
      if (value < 0 || value > 0xffffffff) return null;
      view.setUint32(0, value, le);
      return bytes;
    case "i32":
      if (value < -0x80000000 || value > 0x7fffffff) return null;
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
  if (!field) return { _tag: "unknownField", id: mutation.id };

  if (mutation._tag === "number") {
    const bytes = encodeNumber(field.kind, field.endian, mutation.value);
    if (!bytes) {
      return { _tag: "outOfRange", id: field.id, value: mutation.value };
    }
    return {
      _tag: "ok",
      planned: { analysis, writes: [{ offset: field.offset, bytes }] },
    };
  }

  const bytes = encodeAscii(mutation.value, field.reserved);
  if (!bytes) {
    return {
      _tag: "needsRelocation",
      id: field.id,
      required: new TextEncoder().encode(mutation.value).length + 1,
    };
  }
  return {
    _tag: "ok",
    planned: { analysis, writes: [{ offset: field.offset, bytes }] },
  };
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
