/**
 * RAW Visualization Shader
 *
 * Goal: Directly visualize raw sensor data without full demosaicing algorithms.
 *
 * Process:
 * 1. Reads raw 16-bit integer values from the source texture.
 * 2. Handles endianness swapping (common in RAW formats like RAF).
 * 3. Normalizes 14-bit sensor data (0-16383) to 0.0-1.0 float range.
 * 4. Applies basic Gamma Correction (2.2) for correct display on monitors.
 *
 * 5. Applies Lighting adjustments (Exposure, Contrast, etc.)
 *
 * This provides a quick "preview" mode of the raw data structure.
 */

struct VertexOutput {
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
    // Flip Y to match WebGL/Canvas coord system
    output.uv.y = 1.0 - output.uv.y;
    return output;
}

struct Lighting {
    // x: exposure, y: contrast, z: saturation, w: vibrance
  params1: vec4<f32>,
    // x: highlights, y: shadows, z: whites, w: blacks
    params2: vec4<f32>,
    // x: tint, y: temperature, z: hue, w: padding
    params3: vec4<f32>,
}

struct PackedInfo {
    width: u32,
    height: u32,
    bitsPerSample: u32,
    _pad: u32,
}

@group(0) @binding(0) var sourceTexture: texture_2d<u32>;
@group(0) @binding(1) var<uniform> lighting: Lighting;
@group(0) @binding(2) var<storage, read> packedData: array<u32>;
@group(0) @binding(3) var<uniform> packedInfo: PackedInfo;

// Helper functions
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

fn applyLighting(colorIn: vec4<f32>) -> vec4<f32> {
    var color = colorIn;

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

fn getPackedByte(i: u32) -> u32 {
    let word = packedData[i >> 2u];
    let shift = (i & 3u) * 8u;
    return (word >> shift) & 0xFFu;
}

fn readPacked14(index: u32) -> u32 {
    let bitPos = index * 14u;
    let bytePos = bitPos >> 3u;
    let bitOffset = bitPos & 7u;

    let b0 = getPackedByte(bytePos);
    let b1 = getPackedByte(bytePos + 1u);
    let b2 = getPackedByte(bytePos + 2u);
    let b3 = getPackedByte(bytePos + 3u);

    let window = (b0 << 24u) | (b1 << 16u) | (b2 << 8u) | b3;
    let shift = 32u - 14u - bitOffset;
    return (window >> shift) & 0x3FFFu;
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let dim = textureDimensions(sourceTexture);
    // Ensure coord is within bounds
    let coord = vec2<i32>(floor(uv * vec2<f32>(dim)));

    // Load raw value (R16Uint -> u32)
    let rawVal = textureLoad(sourceTexture, coord, 0).r;

    let swapEndian = lighting.params3.w > 0.5;
    let val = select(rawVal, ((rawVal & 0xFFu) << 8u) | ((rawVal & 0xFF00u) >> 8u), swapEndian);

    // 14-bit max value
    let maxVal = 16383.0;
    var norm = f32(val) / maxVal;

    // Gamma correction
    norm = pow(norm, 1.0 / 2.2);

    return applyLighting(vec4<f32>(norm, norm, norm, 1.0));
}

@fragment
fn fs_main_packed(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let dim = vec2<u32>(packedInfo.width, packedInfo.height);
    let coord = vec2<i32>(floor(uv * vec2<f32>(dim)));

    if coord.x < 0 || coord.y < 0 || coord.x >= i32(dim.x) || coord.y >= i32(dim.y) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    if packedInfo.bitsPerSample != 14u {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    let index = u32(coord.y) * dim.x + u32(coord.x);
    let val = readPacked14(index);

    let maxVal = 16383.0;
    var norm = f32(val) / maxVal;
    norm = pow(norm, 1.0 / 2.2);
    return applyLighting(vec4<f32>(norm, norm, norm, 1.0));
}
