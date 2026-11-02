/**
 * Binary analysis: the immutable description of where every field lives.
 *
 * The reader/writer in `mutate.ts` never owns the bytes. It takes a view plus
 * one of these descriptors and produces a plan — so the same analysis can be
 * cached, shared, persisted or compared without touching the file.
 */

export type Endian = "le" | "be";

export type FieldKind = "u8" | "u16" | "u32" | "i32" | "ascii";

export interface Field {
  readonly id: string;
  readonly kind: FieldKind;
  /** Absolute offset from the start of the view. */
  readonly offset: number;
  /** Bytes reserved for the value: the ceiling for in-place writes. */
  readonly reserved: number;
  readonly endian: Endian;
}

export interface Segment {
  readonly id: string;
  readonly start: number;
  readonly length: number;
  /** Field that stores this segment's length, patched when the segment moves. */
  readonly lengthField?: string;
  readonly checksum?: "crc32";
}

export interface Analysis {
  readonly format: string;
  readonly byteLength: number;
  readonly endian: Endian;
  readonly fields: ReadonlyMap<string, Field>;
  readonly segments: readonly Segment[];
}

export const fieldWidth = (kind: FieldKind): number => {
  switch (kind) {
    case "u8":
      return 1;
    case "u16":
      return 2;
    case "u32":
    case "i32":
      return 4;
    case "ascii":
      return 0;
  }
};

/**
 * Invariants every analysis must satisfy before it is used for a write.
 * Returns human-readable problems; an empty array means the descriptor is sound.
 */
export function validate(analysis: Analysis): readonly string[] {
  const problems: string[] = [];

  for (const field of analysis.fields.values()) {
    const width = fieldWidth(field.kind);
    if (width > 0 && field.reserved < width) {
      problems.push(`field ${field.id}: reserved ${field.reserved} < width ${width}`);
    }
    if (field.offset < 0 || field.offset + field.reserved > analysis.byteLength) {
      problems.push(
        `field ${field.id}: [${field.offset}, ${field.offset + field.reserved}) outside ${analysis.byteLength} bytes`,
      );
    }
  }

  for (const segment of analysis.segments) {
    if (segment.start < 0 || segment.start + segment.length > analysis.byteLength) {
      problems.push(
        `segment ${segment.id}: [${segment.start}, ${segment.start + segment.length}) outside ${analysis.byteLength} bytes`,
      );
    }
    if (segment.lengthField && !analysis.fields.has(segment.lengthField)) {
      problems.push(
        `segment ${segment.id}: length field ${segment.lengthField} is not declared`,
      );
    }
  }

  return problems;
}
