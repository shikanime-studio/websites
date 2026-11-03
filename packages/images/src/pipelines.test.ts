import { describe, expect, it, vi } from "vitest";
import {
  createHistogramComputePipeline,
  createHistogramNormalizePipeline,
  createImagePipeline,
  createRawPipeline,
  createThumbnailPipeline,
} from "./pipelines";

interface Recorder {
  device: GPUDevice;
  shaderModules: Array<{ code: string }>;
  render: Array<Record<string, unknown>>;
  compute: Array<Record<string, unknown>>;
}

/** A device that records what each builder asks for; no GPU involved. */
function recorder(): Recorder {
  const shaderModules: Array<{ code: string }> = [];
  const render: Array<Record<string, unknown>> = [];
  const compute: Array<Record<string, unknown>> = [];
  return {
    device: {
      createShaderModule: vi.fn((descriptor: { code: string }) => {
        shaderModules.push(descriptor);
        return {};
      }),
      createRenderPipeline: vi.fn((descriptor: Record<string, unknown>) => {
        render.push(descriptor);
        return {};
      }),
      createComputePipeline: vi.fn((descriptor: Record<string, unknown>) => {
        compute.push(descriptor);
        return {};
      }),
    } as unknown as GPUDevice,
    shaderModules,
    render,
    compute,
  };
}

describe("render pipeline builders", () => {
  it("builds the thumbnail pipeline against rgba8unorm", () => {
    const r = recorder();
    createThumbnailPipeline(r.device);

    expect(r.shaderModules[0]?.code).toContain("@fragment");
    expect(r.render[0]).toMatchObject({
      layout: "auto",
      vertex: { entryPoint: "vs_main" },
      fragment: {
        entryPoint: "fs_main",
        targets: [{ format: "rgba8unorm" }],
      },
      primitive: { topology: "triangle-strip" },
    });
  });

  it("passes the swap-chain format through the preview pipeline", () => {
    const r = recorder();
    createImagePipeline(r.device, "bgra8unorm");

    const descriptor = r.render[0] as {
      fragment: { targets: Array<{ format: string; blend?: unknown }> };
    };
    expect(descriptor.fragment.targets[0]?.format).toBe("bgra8unorm");
    expect(descriptor.fragment.targets[0]?.blend).toBeDefined();
  });

  it("keeps blending out of the RAW pipeline", () => {
    const r = recorder();
    createRawPipeline(r.device, "rgba16float");

    const descriptor = r.render[0] as {
      fragment: { targets: Array<{ format: string; blend?: unknown }> };
    };
    expect(descriptor.fragment.targets).toEqual([{ format: "rgba16float" }]);
    expect(descriptor.fragment.targets[0]?.blend).toBeUndefined();
  });
});

describe("compute pipeline builders", () => {
  it("uses the compute and normalize entry points from the histogram shader", () => {
    const r = recorder();
    createHistogramComputePipeline(r.device);
    createHistogramNormalizePipeline(r.device);

    expect(r.compute.map((item) => (item.compute as { entryPoint: string }).entryPoint)).toEqual([
      "cs_main",
      "cs_normalize",
    ]);
    expect(r.shaderModules).toHaveLength(2);
  });
});
