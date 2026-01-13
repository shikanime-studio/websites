/**
 * Histogram Compute Shader
 * 
 * Goal: Calculate and Normalize color histograms for image analysis.
 * 
 * Pass 1 (cs_main):
 * - Iterates over the image pixels.
 * - Counts occurrences of each R, G, B value (0-255).
 * - Uses shared memory (localBins) for fast intra-workgroup counting before merging to global memory.
 * 
 * Pass 2 (cs_normalize):
 * - Finds the maximum frequency count across all bins.
 * - Normalizes all bin counts relative to this maximum (0-100 scale).
 * - Crucial for Visualization: Normalization ensures the histogram fits vertically in the UI graph,
 *   regardless of image resolution or pixel count distribution.
 */

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

@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> bins: Bins;
@group(0) @binding(2) var<storage, read_write> normalized: NormalizedBins;

// localBins is shared memory for the workgroup (L1 cache).
// We need the global 'bins' buffer to aggregate results from all workgroups.
var<workgroup> localBins: Bins;

@compute @workgroup_size(16, 16)
fn cs_main(
    @builtin(global_invocation_id) globalId: vec3<u32>,
    @builtin(local_invocation_index) localIndex: u32
) {
    // Initialize local bins
    atomicStore(&localBins.r[localIndex], 0u);
    atomicStore(&localBins.g[localIndex], 0u);
    atomicStore(&localBins.b[localIndex], 0u);

    workgroupBarrier();

    let dimensions = textureDimensions(sourceTexture);
    let x = globalId.x;
    let y = globalId.y;

    if x < dimensions.x && y < dimensions.y {
        let color = textureLoad(sourceTexture, vec2<i32>(i32(x), i32(y)), 0);
        // Use round and clamp to ensure correct bin index and avoid OOB
        let r = u32(clamp(round(color.r * 255.0), 0.0, 255.0));
        let g = u32(clamp(round(color.g * 255.0), 0.0, 255.0));
        let b = u32(clamp(round(color.b * 255.0), 0.0, 255.0));

        atomicAdd(&localBins.r[r], 1u);
        atomicAdd(&localBins.g[g], 1u);
        atomicAdd(&localBins.b[b], 1u);
    }

    workgroupBarrier();

    // Merge local bins to global bins
    let rCount = atomicLoad(&localBins.r[localIndex]);
    let gCount = atomicLoad(&localBins.g[localIndex]);
    let bCount = atomicLoad(&localBins.b[localIndex]);

    if rCount > 0u { atomicAdd(&bins.r[localIndex], rCount); }
    if gCount > 0u { atomicAdd(&bins.g[localIndex], gCount); }
    if bCount > 0u { atomicAdd(&bins.b[localIndex], bCount); }
}

// Workgroup-shared atomic for parallel max reduction
var<workgroup> maxVal: atomic<u32>;

@compute @workgroup_size(256)
fn cs_normalize(@builtin(local_invocation_id) localId: vec3<u32>) {
    let i = localId.x;

    if i == 0u {
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

    if maxCount > 0.0 {
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
