#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y; // Flip Y
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
