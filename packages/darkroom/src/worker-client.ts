/**
 * Worker client — creates and manages an ImageWorker, providing
 * an async API for off-thread image processing.
 */

import type {
  MainToWorkerMessage,
  WorkerToMainMessage,
  RawFrameInfo,
  ExifTagEntry,
} from "./protocol";
import type { DemosaicResult } from "./demosaic";

let worker: Worker | null = null;
let ready = false;

function ensureWorker(): Worker {
  if (worker) return worker;

  // Vite handles worker imports via ?worker query
  worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "fade-image-worker",
  });

  worker.addEventListener("message", (event: MessageEvent<WorkerToMainMessage>) => {
    const message = event.data;
    if (message.type === "ready") {
      ready = true;
    }
  });

  return worker;
}

function sendMessage(message: MainToWorkerMessage): void {
  const w = ensureWorker();
  w.postMessage(message);
}

function awaitResponse<T extends WorkerToMainMessage>(
  requestId: string,
  messageTypes: T["type"][],
  timeoutMs = 30000,
): Promise<T> {
  const w = ensureWorker();

  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      w.removeEventListener("message", handler);
      reject(new Error(`Worker timeout for request ${requestId}`));
    }, timeoutMs);

    function handler(event: MessageEvent<WorkerToMainMessage>) {
      const message = event.data;
      if (
        message.type === "error" &&
        message.requestId === requestId
      ) {
        clearTimeout(timeout);
        w.removeEventListener("message", handler);
        reject(new Error(message.message));
      } else if (
        message.type !== "ready" &&
        message.requestId === requestId &&
        messageTypes.includes(message.type)
      ) {
        clearTimeout(timeout);
        w.removeEventListener("message", handler);
        resolve(message as T);
      }
    }

    w.addEventListener("message", handler);
  });
}

export class ImageWorkerClient {
  private worker: Worker;

  constructor() {
    this.worker = ensureWorker();
  }

  async init(): Promise<void> {
    if (ready) return;
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.worker.removeEventListener("message", handler);
        reject(new Error("Worker init timeout"));
      }, 5000);

      const handler = (event: MessageEvent<WorkerToMainMessage>) => {
        if (event.data.type === "ready") {
          ready = true;
          clearTimeout(timeout);
          this.worker.removeEventListener("message", handler);
          resolve();
        }
      };

      this.worker.addEventListener("message", handler);
      this.worker.postMessage({ action: "init" } satisfies MainToWorkerMessage);
    });
  }

  async demosaic(
    data: ArrayBuffer,
    mimeType: string,
  ): Promise<DemosaicResult> {
    const requestId = generateRequestId();
    sendMessage({ action: "demosaic", requestId, data, mimeType });

    const response = await awaitResponse(
      requestId,
      ["demosaiced", "error"],
    );
    if (response.type !== "demosaiced") {
      throw new Error("Unexpected response type");
    }
    return {
      width: response.width,
      height: response.height,
      pixels: response.pixels,
    };
  }

  async parseRaw(
    data: ArrayBuffer,
    mimeType: string,
  ): Promise<RawFrameInfo> {
    const requestId = generateRequestId();
    sendMessage({ action: "parseRaw", requestId, data, mimeType });

    const response = await awaitResponse(requestId, ["rawParsed", "error"]);
    if (response.type !== "rawParsed") {
      throw new Error("Unexpected response type");
    }
    return response.frame;
  }

  async getExif(
    data: ArrayBuffer,
    mimeType: string,
  ): Promise<ExifTagEntry[]> {
    const requestId = generateRequestId();
    sendMessage({ action: "getExif", requestId, data, mimeType });

    const response = await awaitResponse(requestId, ["exifParsed", "error"]);
    if (response.type !== "exifParsed") {
      throw new Error("Unexpected response type");
    }
    return response.tags;
  }

  terminate(): void {
    if (worker) {
      worker.terminate();
      worker = null;
      ready = false;
    }
  }
}

let idCounter = 0;
function generateRequestId(): string {
  return `req_${Date.now()}_${++idCounter}`;
}

export function createImageWorkerClient(): ImageWorkerClient {
  return new ImageWorkerClient();
}
