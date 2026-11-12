import { Schema } from "effect";

const input = Schema.Struct({
  file: Schema.instanceOf(File),
  mimeType: Schema.Union([Schema.String, Schema.Undefined]),
});

/**
 * postMessage payloads are untrusted: another frame can post anything. Decode
 * once at the boundary, so the handler only ever sees a well-formed request.
 */
export const ImageWorkerRequestSchema = Schema.Union([
  Schema.Struct({
    id: Schema.Number,
    kind: Schema.Literal("exif"),
    input,
  }),
  Schema.Struct({
    id: Schema.Number,
    kind: Schema.Literal("preview"),
    input,
  }),
]);
