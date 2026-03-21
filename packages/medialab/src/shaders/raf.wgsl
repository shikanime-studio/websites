struct LightingParams {
    params1: vec4<f32>,
    params2: vec4<f32>,
    params3: vec4<f32>,
    raw: vec4<f32>,
}

@group(0) @binding(0) var sourceTexture: texture_2d<u32>;
@group(0) @binding(1) var<uniform> lighting: LightingParams;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var positions = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
  );
    let pos = positions[vertexIndex];
    return vec4<f32>(pos, 0.0, 1.0);
}

fn clampCoord(c: vec2<i32>, dim: vec2<i32>) -> vec2<i32> {
    return vec2<i32>(clamp(c.x, 0, dim.x - 1), clamp(c.y, 0, dim.y - 1));
}

fn rawAt(c: vec2<i32>) -> f32 {
    let dimU = textureDimensions(sourceTexture);
    let dim = vec2<i32>(i32(dimU.x), i32(dimU.y));
    let cc = clampCoord(c, dim);
    let v = textureLoad(sourceTexture, cc, 0).r;
    return f32(v);
}

fn cfaColor(x: i32, y: i32, pattern: i32) -> i32 {
    let xx = x & 1;
    let yy = y & 1;

    if pattern == 0 {
        if yy == 0 && xx == 0 { return 0; }
        if yy == 0 && xx == 1 { return 1; }
        if yy == 1 && xx == 0 { return 1; }
        return 2;
    }
    if pattern == 1 {
        if yy == 0 && xx == 0 { return 2; }
        if yy == 0 && xx == 1 { return 1; }
        if yy == 1 && xx == 0 { return 1; }
        return 0;
    }
    if pattern == 2 {
        if yy == 0 && xx == 0 { return 1; }
        if yy == 0 && xx == 1 { return 0; }
        if yy == 1 && xx == 0 { return 2; }
        return 1;
    }
    if yy == 0 && xx == 0 { return 1; }
    if yy == 0 && xx == 1 { return 2; }
    if yy == 1 && xx == 0 { return 0; }
    return 1;
}

fn demosaicBilinear(x: i32, y: i32, pattern: i32) -> vec3<f32> {
    let here = rawAt(vec2<i32>(x, y));
    let color = cfaColor(x, y, pattern);

    if color == 0 {
        let g = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y)) + rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.25;
        let b = (rawAt(vec2<i32>(x - 1, y - 1)) + rawAt(vec2<i32>(x + 1, y - 1)) + rawAt(vec2<i32>(x - 1, y + 1)) + rawAt(vec2<i32>(x + 1, y + 1))) * 0.25;
        return vec3<f32>(here, g, b);
    }

    if color == 2 {
        let g = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y)) + rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.25;
        let r = (rawAt(vec2<i32>(x - 1, y - 1)) + rawAt(vec2<i32>(x + 1, y - 1)) + rawAt(vec2<i32>(x - 1, y + 1)) + rawAt(vec2<i32>(x + 1, y + 1))) * 0.25;
        return vec3<f32>(r, g, here);
    }

    var r: f32 = 0.0;
    var b: f32 = 0.0;
    let leftColor = cfaColor(x - 1, y, pattern);
    let rightColor = cfaColor(x + 1, y, pattern);
    if leftColor == 0 || rightColor == 0 {
        r = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y))) * 0.5;
        b = (rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.5;
    } else {
        r = (rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.5;
        b = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y))) * 0.5;
    }
    return vec3<f32>(r, here, b);
}

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
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let dimU = textureDimensions(sourceTexture);
    let x = clamp(i32(pos.x), 0, i32(dimU.x) - 1);
    let y = clamp(i32(pos.y), 0, i32(dimU.y) - 1);

    let maxVal = lighting.raw.x;
    let pattern = i32(lighting.raw.y + 0.5);

    var rgb = demosaicBilinear(x, y, pattern) / maxVal;

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));

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
    let hueShift = lighting.params3.z;

    rgb = rgb * pow(2.0, exposure);

    let wbR = 1.0 + temperature * 0.5;
    let wbB = 1.0 - temperature * 0.5;
    let wbG = 1.0 + tint * 0.5;
    rgb = vec3<f32>(rgb.r * wbR, rgb.g * wbG, rgb.b * wbB);

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));

    let mid = vec3<f32>(0.5);
    rgb = mix(mid, rgb, contrast);

    let luminance = dot(rgb, vec3<f32>(0.299, 0.587, 0.114));
    let shadowFactor = smoothstep(0.0, 0.5, 1.0 - luminance);
    let highlightFactor = smoothstep(0.5, 1.0, luminance);
    rgb = rgb + shadowFactor * (shadows - 1.0) * 0.2;
    rgb = rgb - highlightFactor * (highlights - 1.0) * 0.2;

    rgb = rgb + (whites - 1.0) * 0.1;
    rgb = rgb - (blacks - 1.0) * 0.1;

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));

    var hsv = rgb2hsv(rgb);
    hsv.x = fract(hsv.x + hueShift);
    hsv.y = hsv.y * saturation;
    hsv.y = clamp(hsv.y, 0.0, 1.0);

    let vibBoost = vibrance * (1.0 - hsv.y) * 0.5;
    hsv.y = clamp(hsv.y + vibBoost, 0.0, 1.0);

    rgb = hsv2rgb(hsv);

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));
    rgb = pow(rgb, vec3<f32>(1.0 / 2.2));

    return vec4<f32>(rgb, 1.0);
}
