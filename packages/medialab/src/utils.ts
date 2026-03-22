export function retryDelay(attemptIndex: number) {
  return Math.min(1000 * 2 ** attemptIndex, 10_000)
}
