struct Bins {
  r: array<atomic<u32>, 256>,
  g: array<atomic<u32>, 256>,
  b: array<atomic<u32>, 256>,
}

struct NormalizedBins {
  r: array<f32, 256>,
  g: array<f32, 256>,
  b: array<f32, 256>,
}

@group(0) @binding(0) var<storage, read_write> bins: Bins;
@group(0) @binding(2) var<storage, read_write> normalized: NormalizedBins;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;

@compute @workgroup_size(16, 16)
fn cs_bins(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let dimensions = textureDimensions(sourceTexture);
  let x = globalId.x;
  let y = globalId.y;

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

// Workgroup-shared atomic for parallel max reduction
var<workgroup> maxVal: atomic<u32>;

@compute @workgroup_size(256)
fn cs_normalize(@builtin(local_invocation_id) localId: vec3<u32>) {
  let i = localId.x;

  if (i == 0u) {
    atomicStore(&maxVal, 0u);
  }
  workgroupBarrier();

  let rCount = atomicLoad(&bins.r[i]);
  let gCount = atomicLoad(&bins.g[i]);
  let bCount = atomicLoad(&bins.b[i]);

  let localMax = max(rCount, max(gCount, bCount));
  atomicMax(&maxVal, localMax);

  workgroupBarrier();

  let maxCount = f32(atomicLoad(&maxVal));

  if (maxCount > 0.0) {
    // Normalize to 0.0-100.0 range
    normalized.r[i] = (f32(rCount) / maxCount) * 100.0;
    normalized.g[i] = (f32(gCount) / maxCount) * 100.0;
    normalized.b[i] = (f32(bCount) / maxCount) * 100.0;
  } else {
    normalized.r[i] = 0.0;
    normalized.g[i] = 0.0;
    normalized.b[i] = 0.0;
  }
}
