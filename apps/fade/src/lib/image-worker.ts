import type {
  ImageTaskKind,
  ImageWorkerTasks,
} from "@shikanime-studio/images/worker";
import {
  createImageWorkerClient,
  handleImageRequest,
} from "@shikanime-studio/images/worker";

type ImageClient = ReturnType<typeof createImageWorkerClient>;

let client: ImageClient | null = null;

function workerClient(): ImageClient {
  client ??= createImageWorkerClient(
    new Worker(new URL("../workers/images.worker.ts", import.meta.url), {
      type: "module",
    }),
  );
  return client;
}

/**
 * Codec work goes to the worker in the browser, and runs in-process on the
 * server, where there is no Worker to post to.
 */
export async function runImageTask<K extends ImageTaskKind>(
  kind: K,
  input: ImageWorkerTasks[K]["input"],
): Promise<ImageWorkerTasks[K]["output"]> {
  if (typeof Worker === "undefined") {
    return (await handleImageRequest({ id: 0, kind, input } as never)) as
      ImageWorkerTasks[K]["output"];
  }
  return workerClient().run(kind, input);
}
