export const CANDY_GRADIENTS = [
  "linear-gradient(135deg, #ffd84d 0%, #ff8a5c 58%, #ff6433 100%)",
  "linear-gradient(135deg, #d9c2ff 0%, #b9daff 58%, #8cc4ff 100%)",
  "linear-gradient(135deg, #c8f56a 0%, #a8e86a 52%, #72c9a0 100%)",
  "linear-gradient(135deg, #ffc9da 0%, #ffa8c5 55%, #d9c2ff 100%)",
  "linear-gradient(135deg, #b9daff 0%, #8cc4ff 52%, #72a5f2 100%)",
] as const;

/** Deterministic candy gradient for a commission thumbnail. */
export function thumbGradient(id: number): string {
  return CANDY_GRADIENTS[id % CANDY_GRADIENTS.length] ?? CANDY_GRADIENTS[0];
}
