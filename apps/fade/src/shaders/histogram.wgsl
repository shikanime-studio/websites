struct HistogramData {
  r: array<atomic<u32>, 256>,
  g: array<atomic<u32>, 256>,
  b: array<atomic<u32>, 256>,
}

@group(0) @binding(0) var<storage, read_write> bins: HistogramData;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let dimensions = textureDimensions(sourceTexture);
  let x = global_id.x;
  let y = global_id.y;

  if (x >= dimensions.x || y >= dimensions.y) {
    return;
  }

  let color = textureLoad(sourceTexture, vec2<i32>(i32(x), i32(y)), 0);
  let r = u32(color.r * 255.0);
  let g = u32(color.g * 255.0);
  let b = u32(color.b * 255.0);

  atomicAdd(&bins.r[r], 1u);
  atomicAdd(&bins.g[g], 1u);
  atomicAdd(&bins.b[b], 1u);
}
