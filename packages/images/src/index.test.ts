import { describe, expect, it } from "vitest";
import * as images from "./index";

describe("public surface", () => {
  it("re-exports the field model, the readers and the builders", () => {
    expect(typeof images.analyzeRafHeader).toBe("function");
    expect(typeof images.plan).toBe("function");
    expect(typeof images.apply).toBe("function");
    expect(typeof images.createImageDataView).toBe("function");
    expect(typeof images.computeHistogram).toBe("function");
    expect(typeof images.createImagePipeline).toBe("function");
  });
});
