import type { Analysis, Field } from "./analysis";

/**
 * The RAF header is the cheapest real case: five big-endian u32 fields at fixed
 * offsets, each pointing at a segment elsewhere in the file. Parsing it is the
 * whole "analysis" step for that container; the CRUD in mutate.ts needs nothing
 * format-specific beyond this descriptor.
 */
export const JpegImageOffset = 84;
export const JpegImageLength = 88;
export const CfaHeaderOffset = 92;
export const CfaHeaderLength = 96;
export const CfaOffset = 100;
export const CfaLength = 104;

const headerField = (id: string, offset: number): Field => ({
  id,
  kind: "u32",
  offset,
  reserved: 4,
  endian: "be",
});

export function analyzeRafHeader(view: DataView): Analysis {
  const fields = new Map<string, Field>([
    ["jpegImageOffset", headerField("jpegImageOffset", JpegImageOffset)],
    ["jpegImageLength", headerField("jpegImageLength", JpegImageLength)],
    ["cfaHeaderOffset", headerField("cfaHeaderOffset", CfaHeaderOffset)],
    ["cfaHeaderLength", headerField("cfaHeaderLength", CfaHeaderLength)],
    ["cfaOffset", headerField("cfaOffset", CfaOffset)],
    ["cfaLength", headerField("cfaLength", CfaLength)],
  ]);

  const start = (id: string): number => {
    const field = fields.get(id);
    return field ? view.getUint32(field.offset, false) : 0;
  };
  const size = (id: string): number => {
    const field = fields.get(id);
    return field ? view.getUint32(field.offset, false) : 0;
  };

  return {
    format: "raf",
    byteLength: view.byteLength,
    endian: "be",
    fields,
    segments: [
      {
        id: "jpeg",
        start: start("jpegImageOffset"),
        length: size("jpegImageLength"),
        lengthField: "jpegImageLength",
      },
      {
        id: "cfaHeader",
        start: start("cfaHeaderOffset"),
        length: size("cfaHeaderLength"),
        lengthField: "cfaHeaderLength",
      },
      {
        id: "cfa",
        start: start("cfaOffset"),
        length: size("cfaLength"),
        lengthField: "cfaLength",
      },
    ],
  };
}
