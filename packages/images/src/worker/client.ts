import type {
  ImageTaskKind,
  ImageWorkerRequest,
  ImageWorkerResponse,
  ImageWorkerTasks,
} from "./protocol";

export interface ImageWorkerClient {
  run: <K extends ImageTaskKind>(
    kind: K,
    input: ImageWorkerTasks[K]["input"],
  ) => Promise<ImageWorkerTasks[K]["output"]>;
  dispose: () => void;
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

/**
 * Request/response over postMessage. One id per call, so concurrent asks cannot
 * resolve each other, and a worker error rejects everything in flight instead
 * of leaving promises hanging.
 */
export function createImageWorkerClient(worker: Worker): ImageWorkerClient {
  let nextId = 1;
  const pending = new Map<number, Pending>();

  const onMessage = (event: MessageEvent) => {
    const response = event.data as ImageWorkerResponse;
    const entry = pending.get(response.id);
    if (!entry) return;
    pending.delete(response.id);
    if (response.ok) {
      entry.resolve(response.output);
    } else {
      entry.reject(new Error(response.error));
    }
  };

  const onError = (event: ErrorEvent) => {
    for (const entry of pending.values()) {
      entry.reject(new Error(event.message || "image worker failed"));
    }
    pending.clear();
  };

  worker.addEventListener("message", onMessage);
  worker.addEventListener("error", onError);

  const run = <K extends ImageTaskKind>(
    kind: K,
    input: ImageWorkerTasks[K]["input"],
  ): Promise<ImageWorkerTasks[K]["output"]> =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      worker.postMessage({ id, kind, input } satisfies ImageWorkerRequest);
    });

  return {
    run,
    dispose: () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      for (const entry of pending.values()) {
        entry.reject(new Error("image worker disposed"));
      }
      pending.clear();
      worker.terminate();
    },
  };
}
