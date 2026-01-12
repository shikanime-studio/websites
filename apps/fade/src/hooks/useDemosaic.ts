import { useEffect } from "react";
import fragmentShaderSource from "../shaders/fragment.glsl?raw";
import vertexShaderSource from "../shaders/vertex.glsl?raw";

export function useDemosaic(
  gl: WebGL2RenderingContext | null,
  width: number,
  height: number,
  data: Uint16Array,
) {
  useEffect(() => {
    if (!gl) return;

    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(vertexShader));
      return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fragmentShader));
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "aPosition",
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Set up texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // R16UI for integer data
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R16UI,
      width,
      height,
      0,
      gl.RED_INTEGER,
      gl.UNSIGNED_SHORT,
      data,
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const textureLocation = gl.getUniformLocation(program, "uTexture");
    gl.uniform1i(textureLocation, 0);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    gl.uniform2f(resolutionLocation, width, height);

    // Render
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Cleanup
    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(texture);
    };
  }, [gl, width, height, data]);
}
