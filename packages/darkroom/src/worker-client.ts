/**
 * Worker client — creates and manages an ImageWorker, providing
 * an async API for off-thread image processing.
 *
 * RPC mechanics (correlation, timeout, error typing) are built on
 * Effect Deferreds; the public surface stays promise-shaped for
 * TanStack Query consumers.
 */

import { Cause, Data, Deferred, Effect } from "effect";
import type { Duration } from "effect";
import type {
  MainToWorkerMessage,
  WorkerToMainMessage,
  RawFrameInfo,
  ExifTagEntry,
} from "./protocol";
import type { DemosaicResult } from "./demosaic";

export class WorkerError extends Data.TaggedError("WorkerError")<{
  message: string;
}> {}

type RequestMessage = Extract<MainToWorkerMessage, { requestId: string }>;
type WorkerReplyType = "rawParsed" | "exifParsed" | "demosaiced";
type Reply<T extends WorkerReplyType> = Extract<
  WorkerToMainMessage,
  { type: T }
>;

let worker: Worker | null = null;
let ready = false;
let initResolve: (() => void) | null = null;

type PendingReply = Deferred.Deferred<WorkerToMainMessage, WorkerError>;
const pending = new Map<string, PendingReply>();

function ensureWorker(): Worker {
  if (worker) return worker;

  // Vite handles worker imports via ?worker query
  worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "fade-image-worker",
  });

  worker.addEventListener(
    "message",
    (event: MessageEvent<WorkerToMainMessage>) => {
      const message = event.data;
      if (message.type === "ready") {
        ready = true;
        const resolve = initResolve;
        initResolve = null;
        resolve?.();
        return;
      }
      if (!message.requestId) return;
      const reply = pending.get(message.requestId);
      if (!reply) return;
      if (message.type === "error") {
        Effect.runSync(
          Deferred.fail(reply, new WorkerError({ message: message.message })),
        );
      } else {
        Effect.runSync(Deferred.succeed(reply, message));
      }
    },
  );

  return worker;
}

function call<T extends WorkerReplyType>(
  message: RequestMessage,
  replyType: T,
  timeout: Duration.DurationInput = "30 seconds",
): Effect.Effect<Reply<T>, WorkerError> {
  return Effect.gen(function* () {
    const reply = yield* Deferred.make<WorkerToMainMessage, WorkerError>();
    pending.set(message.requestId, reply);
    yield* Effect.sync(() => ensureWorker().postMessage(message));
    return yield* Deferred.await(reply).pipe(
      Effect.timeoutFail({
        duration: timeout,
        onTimeout: () =>
          new WorkerError({
            message: `Worker timeout for request ${message.requestId}`,
          }),
      }),
      Effect.ensuring(Effect.sync(() => pending.delete(message.requestId))),
      Effect.flatMap((response) =>
        response.type === replyType
          ? Effect.succeed(response as Reply<T>)
          : Effect.fail(
              new WorkerError({
                message: `Unexpected response type: ${response.type}`,
              }),
            ),
      ),
    );
  });
}

function initEffect(): Effect.Effect<void, WorkerError> {
  return Effect.gen(function* () {
    if (ready) return;
    const done = yield* Deferred.make<void>();
    initResolve = () => Effect.runSync(Deferred.succeed(done, undefined));
    ensureWorker().postMessage({
      action: "init",
    } satisfies MainToWorkerMessage);
    yield* Deferred.await(done).pipe(
      Effect.timeoutFail({
        duration: "5 seconds",
        onTimeout: () => new WorkerError({ message: "Worker init timeout" }),
      }),
      Effect.ensuring(Effect.sync(() => (initResolve = null))),
    );
  });
}

let idCounter = 0;
function generateRequestId(): string {
  return `req_${Date.now()}_${++idCounter}`;
}

/**
 * Bridge an Effect exit to a promise rejection carrying the typed
 * error itself (runPromise wraps failures in FiberFailure; a .catch
 * handler would resolve instead of reject).
 */
function run<A, E>(effect: Effect.Effect<A, E>): Promise<A> {
  return Effect.runPromiseExit(effect).then((exit) =>
    exit._tag === "Success"
      ? exit.value
      : Promise.reject(Cause.squash(exit.cause)),
  );
}

export class ImageWorkerClient {
  init(): Promise<void> {
    return run(initEffect());
  }

  demosaic(data: ArrayBuffer, mimeType: string): Promise<DemosaicResult> {
    return run(
      Effect.map(
        call(
          {
            action: "demosaic",
            requestId: generateRequestId(),
            data,
            mimeType,
          },
          "demosaiced",
        ),
        (response) => ({
          width: response.width,
          height: response.height,
          pixels: response.pixels,
        }),
      ),
    );;
  }

  parseRaw(data: ArrayBuffer, mimeType: string): Promise<RawFrameInfo> {
    return run(
      Effect.map(
        call(
          {
            action: "parseRaw",
            requestId: generateRequestId(),
            data,
            mimeType,
          },
          "rawParsed",
        ),
        (response) => response.frame,
      ),
    );;
  }

  getExif(data: ArrayBuffer, mimeType: string): Promise<ExifTagEntry[]> {
    return run(
      Effect.map(
        call(
          {
            action: "getExif",
            requestId: generateRequestId(),
            data,
            mimeType,
          },
          "exifParsed",
        ),
        (response) => response.tags,
      ),
    );;
  }

  terminate(): void {
    if (worker) {
      worker.terminate();
      worker = null;
      ready = false;
    }
  }
}

export function createImageWorkerClient(): ImageWorkerClient {
  return new ImageWorkerClient();
}

