/**
 * Thumbnail Shader
 *
 * Goal: High-quality image downscaling (generating thumbnails) from a larger source texture.
 *
 * Technique: Adaptive Supersampling / Box Filtering.
 * - Standard nearest-neighbor or bilinear sampling causes aliasing (shimmering/pixelation) when downscaling significantly.
 * - This shader dynamically calculates the pixel footprint (how many source texels cover one destination pixel).
 * - It samples the source texture multiple times (up to 16x16 samples) and averages the results.
 * - This acts as a Box Filter, effectively filtering out high-frequency noise and producing smooth, photography-grade thumbnails.
 */

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

struct Uniforms {
    scale: vec2f,
    offset: vec2f,
}

@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2f, 4>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0)
    );

    var uvs = array<vec2f, 4>(
        vec2f(0.0, 1.0),
        vec2f(1.0, 1.0),
        vec2f(0.0, 0.0),
        vec2f(1.0, 0.0)
    );

    var output: VertexOutput;
    output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    output.uv = uvs[vertexIndex] * uniforms.scale + uniforms.offset;
    return output;
}

@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    let texDim = vec2f(textureDimensions(myTexture));
    let dUVdx = dpdx(input.uv);
    let dUVdy = dpdy(input.uv);

    // Estimate pixel footprint size in texels
    let pixelScale = max(length(dUVdx * texDim), length(dUVdy * texDim));

    // If downscaling significantly, use box sampling
    // We limit max steps to avoid performance cliff on massive downscales
    // 16 steps means 16x16 = 256 samples, which is heavy but acceptable for offline/one-off thumbnail gen.
    // For real-time, we'd want mipmaps.
    let steps = clamp(ceil(pixelScale), 1.0, 16.0);

    if steps <= 1.0 {
        return textureSampleLevel(myTexture, mySampler, input.uv, 0.0);
    }

    var color = vec4f(0.0);
    var totalWeight = 0.0;

    // Sample a grid within the pixel footprint
    for (var x = 0.0; x < steps; x = x + 1.0) {
        for (var y = 0.0; y < steps; y = y + 1.0) {
            // Offset from 0 to 1 across the footprint
            let offX = (x + 0.5) / steps - 0.5;
            let offY = (y + 0.5) / steps - 0.5;

            // Adjust UV based on derivatives
            let sampleUV = input.uv + dUVdx * offX + dUVdy * offY;

            color = color + textureSampleLevel(myTexture, mySampler, sampleUV, 0.0);
            totalWeight = totalWeight + 1.0;
        }
    }

    return color / totalWeight;
}
