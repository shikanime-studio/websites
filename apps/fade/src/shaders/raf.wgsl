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

@group(0) @binding(0) var sourceTexture: texture_2d<u32>;

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let dim = textureDimensions(sourceTexture);
    // Ensure coord is within bounds
    let coord = vec2<i32>(floor(uv * vec2<f32>(dim)));

    // Load raw value (R16Uint -> u32)
    let rawVal = textureLoad(sourceTexture, coord, 0).r;

    // Swap endianness (little endian read from big endian data)
    let val = ((rawVal & 0xFFu) << 8u) | ((rawVal & 0xFF00u) >> 8u);

    // 14-bit max value
    let maxVal = 16383.0;
    var norm = f32(val) / maxVal;

    // Gamma correction
    norm = pow(norm, 1.0 / 2.2);

    return vec4<f32>(norm, norm, norm, 1.0);
}
