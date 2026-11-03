import { serveImageWorker } from "@shikanime-studio/images/worker";

// The codec runs here; the main thread keeps React and the GPU.
// `globalThis` is the DedicatedWorkerGlobalScope in a module worker.
serveImageWorker(
  globalThis as unknown as Parameters<typeof serveImageWorker>[0],
);
