import type { ExifTagEntry } from "../codec/exif";

/** Everything the worker can be asked to do, and what it answers with. */
export interface ImageWorkerTasks {
  exif: {
    input: { file: File; mimeType: string | undefined };
    output: Array<ExifTagEntry> | null;
  };
  preview: {
    input: { file: File; mimeType: string | undefined };
    output: { bytes: ArrayBuffer; type: string } | null;
  };
}

export type ImageTaskKind = keyof ImageWorkerTasks;

export type ImageWorkerRequest = {
  [K in ImageTaskKind]: {
    readonly id: number;
    readonly kind: K;
    readonly input: ImageWorkerTasks[K]["input"];
  };
}[ImageTaskKind];

export type ImageWorkerResponse = {
  [K in ImageTaskKind]:
    | {
      readonly id: number;
      readonly kind: K;
      readonly ok: true;
      readonly output: ImageWorkerTasks[K]["output"];
    }
    | {
      readonly id: number;
      readonly kind: K;
      readonly ok: false;
      readonly error: string;
    };
}[ImageTaskKind];

/** The slice of DedicatedWorkerGlobalScope the host needs. */
export interface WorkerScope {
  postMessage: (value: unknown) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent) => void,
  ) => void;
}
