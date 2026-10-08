/**
 * Worker client — typed RPC over the image worker as an Effect service.
 *
 * Correlation, timeouts, and error typing are built from Effect
 * primitives: each request gets a Deferred, replies are routed by
 * requestId, `Effect.timeout` bounds every wait with the typed
 * `Cause.TimeoutError`, and `Effect.catchIf` narrows it to
 * `WorkerError` at the service boundary.
 */

import {
  Cause,
  Context,
  Data,
  Deferred,
  Effect,
  Exit,
  Layer,
} from "effect";
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

/** Subset of the global Worker surface the client relies on. */
interface WorkerLike {
  postMessage(message: MainToWorkerMessage): void;
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<WorkerToMainMessage>) => void,
  ): void;
}

/** Live browser worker construction; the test Layer swaps this out. */
const makeBrowserWorker = (): WorkerLike =>
  new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "fade-image-worker",
  });

const CALL_TIMEOUT: Duration.Input = "30 seconds";
const INIT_TIMEOUT: Duration.Input = "5 seconds";

/**
 * The image worker transport in context: readiness plus typed RPC.
 * Layers provide the transport; pipelines stay transport-agnostic.
 */
export class ImageWorker extends Context.Service<
  ImageWorker,
  {
    readonly call: <T extends WorkerReplyType>(
      message: RequestMessage,
      replyType: T,
    ) => Effect.Effect<Reply<T>, WorkerError>;
  }
>()("ImageWorker") {}

const completeReply = (
  reply: Deferred.Deferred<WorkerToMainMessage, WorkerError>,
  message: WorkerToMainMessage,
): Effect.Effect<void> =>
  Effect.asVoid(
    message.type === "error"
      ? Deferred.done(
          reply,
          Exit.fail(new WorkerError({ message: message.message })),
        )
      : Deferred.done(reply, Exit.succeed(message)),
  );

interface ConnectionState {
  readonly worker: WorkerLike;
  ready: boolean;
  initResolve: Deferred.Deferred<void> | null;
  readonly pending: Map<
    string,
    Deferred.Deferred<WorkerToMainMessage, WorkerError>
  >;
}

const completeInit = (state: ConnectionState): Effect.Effect<void> => {
  state.ready = true;
  const resolve = state.initResolve;
  state.initResolve = null;
  return resolve
    ? Effect.asVoid(Deferred.done(resolve, Exit.succeed(undefined)))
    : Effect.void;
};

const routeMessage = (
  state: ConnectionState,
  message: WorkerToMainMessage,
): Effect.Effect<void> => {
  if (message.type === "ready") return completeInit(state);
  if (!message.requestId) return Effect.void;
  const reply = state.pending.get(message.requestId);
  if (!reply) return Effect.void;
  return completeReply(reply, message);
};

const listen = (state: ConnectionState): void => {
  state.worker.addEventListener("message", (event) => {
    Effect.runSync(routeMessage(state, event.data));
  });
};

const awaitReady = (
  state: ConnectionState,
): Effect.Effect<void, WorkerError> =>
  Effect.suspend(() => {
    if (state.ready) return Effect.void;
    return Effect.flatMap(Deferred.make<void>(), (done) =>
      Effect.gen(function* () {
        state.initResolve = done;
        state.worker.postMessage({ action: "init" });
        yield* Effect.catchIf(
          Effect.timeout(Deferred.await(done), INIT_TIMEOUT),
          Cause.isTimeoutError,
          () => new WorkerError({ message: "Worker init timeout" }),
        );
      }),
    );
  });

const awaitedReply = <T extends WorkerReplyType>(
  state: ConnectionState,
  message: RequestMessage,
  replyType: T,
): Effect.Effect<Reply<T>, WorkerError> =>
  Effect.flatMap(Deferred.make<WorkerToMainMessage, WorkerError>(), (reply) =>
    Effect.gen(function* () {
      state.pending.set(message.requestId, reply);
      state.worker.postMessage(message);
      const response = yield* Effect.catchIf(
        Effect.timeout(Deferred.await(reply), CALL_TIMEOUT),
        Cause.isTimeoutError,
        () =>
          new WorkerError({
            message: `Worker timeout for request ${message.requestId}`,
          }),
      );
      if (isReply(response, replyType)) return response;
      return yield* Effect.fail(
        new WorkerError({
          message: `Unexpected response type: ${response.type}`,
        }),
      );
    }).pipe(
      Effect.ensuring(
        Effect.sync(() => {
          state.pending.delete(message.requestId);
        }),
      ),
    ),
  );

/** Transport over a fresh browser worker with Deferred-based routing. */
export const ImageWorkerLive = Layer.effect(
  ImageWorker,
  Effect.sync(() => {
    const state: ConnectionState = {
      worker: makeBrowserWorker(),
      ready: false,
      initResolve: null,
      pending: new Map(),
    };
    listen(state);
    return {
      call: <T extends WorkerReplyType>(
        message: RequestMessage,
        replyType: T,
      ): Effect.Effect<Reply<T>, WorkerError> =>
        Effect.flatMap(awaitReady(state), () =>
          awaitedReply(state, message, replyType),
        ),
    };
  }),
);

function isReply<T extends WorkerReplyType>(
  response: WorkerToMainMessage,
  replyType: T,
): response is Reply<T> {
  return response.type === replyType;
}

let idCounter = 0;
const generateRequestId = (): string => `req_${Date.now()}_${++idCounter}`;

const demosaicMessage = (
  data: ArrayBuffer,
  mimeType: string,
): RequestMessage => ({
  action: "demosaic",
  requestId: generateRequestId(),
  data,
  mimeType,
});

const parseRawMessage = (
  data: ArrayBuffer,
  mimeType: string,
): RequestMessage => ({
  action: "parseRaw",
  requestId: generateRequestId(),
  data,
  mimeType,
});

const getExifMessage = (
  data: ArrayBuffer,
  mimeType: string,
): RequestMessage => ({
  action: "getExif",
  requestId: generateRequestId(),
  data,
  mimeType,
});

const withWorker = Effect.map(ImageWorker, (worker) => worker.call);

/** Demosaic raw sensor data off-thread. */
export const demosaic = (
  data: ArrayBuffer,
  mimeType: string,
): Effect.Effect<DemosaicResult, WorkerError, ImageWorker> =>
  Effect.flatMap(withWorker, (call) =>
    Effect.map(
      call(demosaicMessage(data, mimeType), "demosaiced"),
      (response) => ({
        width: response.width,
        height: response.height,
        pixels: response.pixels,
      }),
    ),
  );

/** Parse a RAW container into the worker frame contract. */
export const parseRaw = (
  data: ArrayBuffer,
  mimeType: string,
): Effect.Effect<RawFrameInfo, WorkerError, ImageWorker> =>
  Effect.flatMap(withWorker, (call) =>
    Effect.map(
      call(parseRawMessage(data, mimeType), "rawParsed"),
      (response) => response.frame,
    ),
  );

/** Extract EXIF tag entries off-thread. */
export const getExif = (
  data: ArrayBuffer,
  mimeType: string,
): Effect.Effect<Array<ExifTagEntry>, WorkerError, ImageWorker> =>
  Effect.flatMap(withWorker, (call) =>
    Effect.map(
      call(getExifMessage(data, mimeType), "exifParsed"),
      (response) => response.tags,
    ),
  );
