struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, 1.0)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.uv = pos[vertexIndex] * 0.5 + 0.5;
    output.uv.y = 1.0 - output.uv.y;
    return output;
}

struct DemosaicUniforms {
    // Raw image dimensions
    width: u32,
    height: u32,
    // Bayer CFA pattern offsets
    cfaR: f32, // UV offset for R channel
    cfaG: f32, // UV offset for G channel
    cfaB: f32, // UV offset for B channel
    // Edge-aware blending params
    edgeStrength: f32,
};

@group(0) @binding(0) var<uniform> uniforms: DemosaicUniforms;
@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_2d<f32>;

// Bayer CFA interpolation
// RGGB pattern (top-left is R):
//   Even row: R G R G ...
//   Odd row:  G B G B ...
//
// For a given pixel, we interpolate missing channels from available neighbors:
// - R (even,even): missing G (use H), missing B (use V)
// - G (odd,even):  missing R (use H), missing B (use V)
// - G (even,odd):  missing R (use V), missing B (use H)
// - B (odd,odd):   missing G (use H), missing R (use V)

fn clamp8(v: f32) -> f32 {
    return clamp(v, 0.0, 1.0);
}

// Bilinear sampling helper
fn sampleTex(uv: vec2<f32>) -> vec3<f32> {
    return textureSample(myTexture, mySampler, uv).rgb;
}

fn sampleTex4(uv: vec2<f32>) -> vec4<f32> {
    return textureSample(myTexture, mySampler, uv);
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let w = f32(uniforms.width);
    let h = f32(uniforms.height);
    let hw = 1.0 / w;
    let hh = 1.0 / h;

    // Convert UV to pixel coordinates
    let px = uv.x * w;
    let py = uv.y * h;
    let ix = i32(px);
    let iy = i32(py);

    // Determine Bayer position in the 2x2 block
    let isEvenRow = iy % 2 == 0;
    let isEvenCol = ix % 2 == 0;

    // Texture samples at half-pixel offsets for interpolation
    // Sample at the center of each 2x2 Bayer cell for the given color
    let texRow = f32(iy);
    let texCol = f32(ix);

    if isEvenRow && isEvenCol {
        // R position in RGGB — interpolate G from left/right, B from top/bottom
        let center = vec2<f32>(texCol + 0.5, texRow + 0.5);
        let gUv = vec2<f32>(center.x, texRow + 0.5);
        let bUv = vec2<f32>(texCol + 0.5, center.y);
        let r = sampleTex(center);
        let g = sampleTex(gUv);
        let b = sampleTex(bUv);
        return vec4<f32>(r, g, b, 1.0);
    } else if isEvenRow && !isEvenCol {
        // G position (odd col, even row) — interpolate R from left/right, B from top/bottom
        let center = vec2<f32>(texCol + 0.5, texRow + 0.5);
        let rUv = vec2<f32>(center.x, texRow + 0.5);
        let bUv = vec2<f32>(texCol + 0.5, center.y);
        let g = sampleTex(center);
        let r = sampleTex(rUv);
        let b = sampleTex(bUv);
        return vec4<f32>(r, g, b, 1.0);
    } else if !isEvenRow && isEvenCol {
        // G position (even col, odd row) — interpolate R from top/bottom, B from left/right
        let center = vec2<f32>(texCol + 0.5, texRow + 0.5);
        let rUv = vec2<f32>(texCol + 0.5, center.y);
        let bUv = vec2<f32>(center.x, texRow + 0.5);
        let g = sampleTex(center);
        let r = sampleTex(rUv);
        let b = sampleTex(bUv);
        return vec4<f32>(r, g, b, 1.0);
    } else {
        // B position (odd, odd) — interpolate G from left/right, R from top/bottom
        let center = vec2<f32>(texCol + 0.5, texRow + 0.5);
        let gUv = vec2<f32>(center.x, texRow + 0.5);
        let rUv = vec2<f32>(texCol + 0.5, center.y);
        let b = sampleTex(center);
        let g = sampleTex(gUv);
        let r = sampleTex(rUv);
        return vec4<f32>(r, g, b, 1.0);
    }
}
