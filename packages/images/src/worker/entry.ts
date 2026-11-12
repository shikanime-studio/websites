import type { ImageWorkerRequest, WorkerScope } from "./protocol";
import { handleImageRequest } from "./handler";

/**
 * Wire a DedicatedWorkerGlobalScope to the handler. The app's worker file is
 * then a single call: `serveImageWorker(self)`.
 */
export function serveImageWorker(scope: WorkerScope): void {
  scope.addEventListener("message", (event: MessageEvent) => {
    const request = event.data as ImageWorkerRequest;
    void handleImageRequest(request)
      .then((output) => {
        scope.postMessage({
          id: request.id,
          kind: request.kind,
          ok: true,
          output,
        });
      })
      .catch((error: unknown) => {
        scope.postMessage({
          id: request.id,
          kind: request.kind,
          ok: false,
          error: error instanceof Error ? error.message : "image task failed",
        });
      });
  });
}
