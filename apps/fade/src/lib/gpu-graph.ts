import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";

/** Feature detection, resolved once per runtime. */
export const gpuSupportedAtom = make(
  typeof navigator !== "undefined" && "gpu" in navigator,
);

export const gpuAdapterAtom = make((get) =>
  Effect.gen(function* () {
    if (!get(gpuSupportedAtom)) {
      console.warn("GPU not supported");
      return null;
    }
    return yield* Effect.tryPromise({
      try: () => navigator.gpu.requestAdapter(),
      catch: () => null,
    });
  }),
);

export const gpuDeviceAtom = make((get) =>
  Effect.gen(function* () {
    const adapter = yield* get.result(gpuAdapterAtom);
    if (!adapter) return null;
    const device = yield* Effect.tryPromise({
      try: () => adapter.requestDevice(),
      catch: () => null,
    });
    if (device) {
      // A lost device is a graph event: refresh this atom so a replacement
      // is requested, and record why for anyone reading the last loss.
      yield* Effect.forkScoped(
        Effect.gen(function* () {
          yield* Effect.tryPromise(() => device.lost);
          get.setSelf(null);
          get.refresh(gpuDeviceAtom);
        }),
      );
      get.addFinalizer(() => {
        device.destroy();
      });
    }
    return device;
  }),
);


export const gpuFormatAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    return device ? navigator.gpu.getPreferredCanvasFormat() : null;
  }),
);
