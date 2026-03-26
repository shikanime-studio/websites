import { useSuspenseQuery as g } from "@tanstack/react-query";
import { useEffect as d } from "react";
import { useGpuDevice as x, useGpuFormat as b } from "./gpu.js";
import { retryDelay as h } from "../utils.js";
const y = `struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0,  1.0)
  );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.uv = pos[vertexIndex] * 0.5 + 0.5;
    output.uv.y = 1.0 - output.uv.y;
    return output;
}

struct Lighting {
    params1: vec4<f32>,
    params2: vec4<f32>,
    params3: vec4<f32>,
}

@group(0) @binding(0) var<uniform> lighting: Lighting;
@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_2d<f32>;

fn rgb2hsv(c: vec3<f32>) -> vec3<f32> {
    let K = vec4<f32>(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    let p = mix(vec4<f32>(c.bg, K.wz), vec4<f32>(c.gb, K.xy), step(c.b, c.g));
    let q = mix(vec4<f32>(p.xyw, c.r), vec4<f32>(c.r, p.yzx), step(p.x, c.r));
    let d = q.x - min(q.w, q.y);
    let e = 1.0e-10;
    return vec3<f32>(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

fn hsv2rgb(c: vec3<f32>) -> vec3<f32> {
    let K = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), c.y);
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    var color = textureSample(myTexture, mySampler, uv);

    let exposure = lighting.params1.x;
    let contrast = lighting.params1.y;
    let saturation = lighting.params1.z;
    let vibrance = lighting.params1.w;

    let highlights = lighting.params2.x;
    let shadows = lighting.params2.y;
    let whites = lighting.params2.z;
    let blacks = lighting.params2.w;

    let tint = lighting.params3.x;
    let temperature = lighting.params3.y;
    let hue = lighting.params3.z;

    color = vec4<f32>(color.rgb * pow(2.0, exposure), color.a);

    let tempAdj = vec3<f32>(temperature * 0.1, 0.0, -temperature * 0.1);
    let tintAdj = vec3<f32>(0.0, tint * 0.1, 0.0);
    color = vec4<f32>(color.rgb + tempAdj + tintAdj, color.a);

    color = vec4<f32>((color.rgb - 0.5) * contrast + 0.5, color.a);

    let luma = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));

    if luma > 0.5 {
        color = vec4<f32>(color.rgb + (1.0 - luma) * highlights * 0.2, color.a);
    } else {
        color = vec4<f32>(color.rgb + luma * shadows * 0.2, color.a);
    }

    color = vec4<f32>(color.rgb * (1.0 + whites * 0.1) + blacks * 0.1, color.a);

    let gray = vec3<f32>(luma);
    var satColor = mix(gray, color.rgb, saturation);

    let maxComp = max(color.r, max(color.g, color.b));
    let minComp = min(color.r, min(color.g, color.b));
    let currentSat = maxComp - minComp;
    let vib = clamp(vibrance, -1.0, 1.0);
    let vibStrength = (1.0 - currentSat) * abs(vib);
    if vib > 0.0 {
        satColor = mix(satColor, color.rgb, vibStrength);
    } else if vib < 0.0 {
        satColor = mix(satColor, gray, vibStrength);
    }

    color = vec4<f32>(satColor, color.a);

    if hue != 0.0 {
        var hsv = rgb2hsv(color.rgb);
        hsv.x = fract(hsv.x + hue);
        color = vec4<f32>(hsv2rgb(hsv), color.a);
    }

    color = vec4<f32>(clamp(color.rgb, vec3<f32>(0.0), vec3<f32>(1.0)), color.a);

    return color;
}
`;
function w(t, r) {
  return g({
    queryKey: ["image-pipeline", t, r],
    queryFn: () => {
      if (!t || !r)
        return null;
      const e = t.createShaderModule({
        code: y
      });
      return t.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: e,
          entryPoint: "vs_main"
        },
        fragment: {
          module: e,
          entryPoint: "fs_main",
          targets: [
            {
              format: r,
              blend: {
                color: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                }
              }
            }
          ]
        },
        primitive: {
          topology: "triangle-strip"
        }
      });
    },
    retry: 3,
    retryDelay: h,
    staleTime: 1 / 0
  });
}
function T(t, r) {
  const e = r ? r.currentSrc || r.src : null, n = r?.naturalWidth ?? 0, o = r?.naturalHeight ?? 0;
  return g({
    queryKey: ["image-texture", t, e, n, o],
    queryFn: async () => {
      if (!t || !e || n <= 0 || o <= 0)
        return null;
      const c = await (await fetch(e)).blob(), i = await createImageBitmap(c), u = t.createTexture({
        size: [i.width, i.height],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
      });
      return t.queue.copyExternalImageToTexture(
        { source: i },
        { texture: u },
        { width: i.width, height: i.height }
      ), u;
    },
    retry: 3,
    retryDelay: h,
    staleTime: 1 / 0
  });
}
function q(t) {
  const r = g({
    queryKey: ["image-uniform-buffer", t],
    queryFn: () => t ? t.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }) : null,
    retry: 3,
    retryDelay: h,
    staleTime: 1 / 0
  });
  return d(() => () => {
    r.data?.destroy();
  }, [r.data]), r;
}
function P(t, r, e) {
  const { device: n } = x(), o = b(), l = w(n, o), c = T(n, r), i = q(n);
  return g({
    queryKey: [
      "image-render",
      t,
      n,
      o,
      l.data,
      c.data,
      i.data,
      e?.lighting?.exposure,
      e?.lighting?.contrast,
      e?.lighting?.saturation,
      e?.lighting?.vibrance,
      e?.lighting?.highlights,
      e?.lighting?.shadows,
      e?.lighting?.whites,
      e?.lighting?.blacks,
      e?.lighting?.tint,
      e?.lighting?.temperature,
      e?.lighting?.hue
    ],
    queryFn: () => {
      if (typeof document > "u")
        return null;
      const u = document.getElementById(t);
      if (!n || !u || !o || !l.data || !c.data || !i.data)
        return null;
      const m = u.getContext("webgpu");
      if (!m)
        return null;
      m.configure({
        device: n,
        format: o,
        alphaMode: "premultiplied"
      });
      const a = {
        exposure: e?.lighting?.exposure ?? 0,
        contrast: e?.lighting?.contrast ?? 1,
        saturation: e?.lighting?.saturation ?? 1,
        vibrance: e?.lighting?.vibrance ?? 0,
        highlights: e?.lighting?.highlights ?? 0,
        shadows: e?.lighting?.shadows ?? 0,
        whites: e?.lighting?.whites ?? 0,
        blacks: e?.lighting?.blacks ?? 0,
        tint: e?.lighting?.tint ?? 0,
        temperature: e?.lighting?.temperature ?? 0,
        hue: e?.lighting?.hue ?? 0
      };
      n.queue.writeBuffer(
        i.data,
        0,
        new Float32Array([
          a.exposure,
          a.contrast,
          a.saturation,
          a.vibrance,
          a.highlights,
          a.shadows,
          a.whites,
          a.blacks,
          a.tint,
          a.temperature,
          a.hue,
          0
        ])
      );
      const p = n.createBindGroup({
        layout: l.data.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: i.data
            }
          },
          {
            binding: 1,
            resource: n.createSampler({
              magFilter: "linear",
              minFilter: "linear"
            })
          },
          {
            binding: 2,
            resource: c.data.createView()
          }
        ]
      }), f = n.createCommandEncoder(), v = m.getCurrentTexture().createView(), s = f.beginRenderPass({
        colorAttachments: [
          {
            view: v,
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store"
          }
        ]
      });
      return s.setPipeline(l.data), s.setBindGroup(0, p), s.draw(4), s.end(), n.queue.submit([f.finish()]), !0;
    },
    retry: 3,
    retryDelay: h,
    staleTime: 1 / 0
  });
}
export {
  P as useImageRender
};
//# sourceMappingURL=image.js.map
