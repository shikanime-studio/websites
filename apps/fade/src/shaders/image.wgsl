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

@group(0) @binding(0) var<uniform> lighting: Lighting;
@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_2d<f32>;

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

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    var color = textureSample(myTexture, mySampler, uv);

    // Unpack parameters
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

    // Exposure
    color = vec4<f32>(color.rgb * pow(2.0, exposure), color.a);

    // White Balance (Temperature & Tint)
    // Simple approximation:
    // Temperature: adjust R/B
    // Tint: adjust G
    let tempAdj = vec3<f32>(temperature * 0.1, 0.0, -temperature * 0.1);
    let tintAdj = vec3<f32>(0.0, tint * 0.1, 0.0);
    color = vec4<f32>(color.rgb + tempAdj + tintAdj, color.a);

    // Contrast
    color = vec4<f32>((color.rgb - 0.5) * contrast + 0.5, color.a);

    // Highlights / Shadows (Simple tone mapping)
    let luma = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));

    // Highlights: affect bright areas (luma > 0.5)
    // Shadows: affect dark areas (luma < 0.5)
    // Simplified curve approach
    if luma > 0.5 {
        color = vec4<f32>(color.rgb + (1.0 - luma) * highlights * 0.2, color.a);
    } else {
        color = vec4<f32>(color.rgb + luma * shadows * 0.2, color.a);
    }

    // Whites / Blacks
    // Whites: stretch top range
    // Blacks: stretch bottom range
    // Very simplified
    color = vec4<f32>(color.rgb * (1.0 + whites * 0.1) + blacks * 0.1, color.a);

    // Saturation & Vibrance
    let gray = vec3<f32>(luma);
    var satColor = mix(gray, color.rgb, saturation);

    // Vibrance: boosts saturation of less saturated colors more
    let maxComp = max(color.r, max(color.g, color.b));
    let minComp = min(color.r, min(color.g, color.b));
    let currentSat = maxComp - minComp;
    satColor = mix(satColor, color.rgb, (1.0 - currentSat) * vibrance);

    color = vec4<f32>(satColor, color.a);

    // Hue
    if hue != 0.0 {
        var hsv = rgb2hsv(color.rgb);
        hsv.x = fract(hsv.x + hue / 360.0);
        color = vec4<f32>(hsv2rgb(hsv), color.a);
    }

    // Clamp results
    color = vec4<f32>(clamp(color.rgb, vec3<f32>(0.0), vec3<f32>(1.0)), color.a);

    return color;
}
