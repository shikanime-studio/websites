import { describe, expect, it } from "vitest";
import { computeHistogram } from "./histogram";
import { renderThumbnail } from "./thumbnail";

describe("renderThumbnail guards", () => {
  const blob = new Blob(["x"], { type: "text/plain" });

  it("returns null without a device", async () => {
    await expect(
      renderThumbnail({
        device: null,
        pipeline: null,
        blob,
        mimeType: undefined,
        width: 8,
        height: 8,
        quality: 1,
      }),
    ).resolves.toBeNull();
  });

  it("returns null for a blob that is not an image", async () => {
    await expect(
      renderThumbnail({
        device: {} as GPUDevice,
        pipeline: {} as GPURenderPipeline,
        blob,
        mimeType: "image/jpeg",
        width: 8,
        height: 8,
        quality: 1,
      }),
    ).resolves.toBeNull();
  });
});

describe("computeHistogram guards", () => {
  it("returns null without both pipelines", async () => {
    await expect(
      computeHistogram({
        device: null,
        computePipeline: null,
        normalizePipeline: null,
        imageKey: { src: "data:,", width: 1, height: 1 },
      }),
    ).resolves.toBeNull();
  });
});
