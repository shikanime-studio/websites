#version 300 es
precision highp float;
precision highp usampler2D;

in vec2 vUv;
out vec4 fragColor;

uniform usampler2D uTexture;
uniform vec2 uResolution;

void main() {
  // Simple debayering (bilinear for RGGB)
  // This is NOT correct for X-Trans, but shows color.

  vec2 texelSize = 1.0 / uResolution;
  vec2 coord = vUv * uResolution;

  // Determine pixel position parity
  // For RGGB:
  // R G
  // G B

  int x = int(coord.x);
  int y = int(coord.y);

  float val = float(texture(uTexture, vUv).r);

  // Normalize (14-bit)
  float maxVal = 16383.0;

  // For a simple visualization, let's just show the raw data as grayscale first
  // to avoid incorrect artifacts from wrong demosaicing pattern.
  float norm = val / maxVal;

  // Gamma correction
  norm = pow(norm, 1.0 / 2.2);

  fragColor = vec4(norm, norm, norm, 1.0);
}
