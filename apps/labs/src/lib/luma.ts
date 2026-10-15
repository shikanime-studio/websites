export const ROWS = 28;
export const COLS = 96;
export const RAMP = " .:-=+*#%@";

const W = Math.max(2, Math.round(COLS / 2));
const H = Math.max(2, Math.round(ROWS / 2));

export function createSampler(): (frame: number) => Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  return (frame: number) => {
    canvas.width = W;
    canvas.height = H;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    const t = frame / 24;
    for (let i = 0; i < 3; i++) {
      const x = (0.5 + 0.32 * Math.sin(t + (i * 2 * Math.PI) / 3)) * W;
      const y = (0.5 + 0.32 * Math.cos(t * 1.3 + (i * 2 * Math.PI) / 3)) * H;
      const r = Math.max(
        1,
        (0.12 + 0.06 * Math.sin(t * 0.7 + i)) * Math.min(W, H),
      );
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(20,5,2,0.9)");
      g.addColorStop(1, "rgba(20,5,2,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return ctx.getImageData(0, 0, W, H).data;
  };
}

export function renderFrame(data: Uint8ClampedArray): {
  text: string;
  luma: number;
} {
  let out = "";
  let sum = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const sx = Math.min(W - 1, Math.floor((x / COLS) * W));
      const sy = Math.min(H - 1, Math.floor((y / ROWS) * H));
      const a = (data[(sy * W + sx) * 4 + 3] ?? 0) / 255;
      sum += a;
      out +=
        RAMP[Math.min(RAMP.length - 1, Math.floor(a * RAMP.length))] ?? " ";
    }
    out += "\n";
  }
  return { text: out, luma: sum / (ROWS * COLS) };
}
