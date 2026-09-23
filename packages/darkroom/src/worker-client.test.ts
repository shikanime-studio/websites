import { Cause, Effect, Exit } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ImageWorker,
  ImageWorkerLive,
  demosaic,
  getExif,
  parseRaw,
} from "./worker-client";

type AnyMessage = Record<string, unknown>;

/** When false, the double swallows `init` (drives the init-timeout path). */
let autoReady = true;

/**
 * Minimal Worker double: records posted messages and replays scripted
 * replies through the normal event path.
 */
class FakeWorker extends EventTarget {
  static current: FakeWorker | null = null;

  posted: AnyMessage[] = [];

  constructor() {
    super();
    FakeWorker.current = this;
  }

  postMessage(message: AnyMessage): void {
    this.posted.push(message);
    if (message.action === "init" && autoReady) {
      queueMicrotask(() => this.reply({ type: "ready" }));
    }
  }

  reply(message: AnyMessage): void {
    this.dispatchEvent(new MessageEvent("message", { data: message }));
  }
}

async function run<A, E>(
  program: Effect.Effect<A, E, ImageWorker>,
): Promise<Exit.Exit<A, E>> {
  vi.resetModules();
  vi.stubGlobal("Worker", FakeWorker);
  FakeWorker.current = null;
  return Effect.runPromiseExit(
    Effect.provide(program, ImageWorkerLive) as Effect.Effect<A, E>,
  );
}

function requestIdOf(worker: FakeWorker, action: string): string {
  const posted = worker.posted.find((m) => m.action === action);
  if (!posted) throw new Error(`no ${action} posted`);
  return posted.requestId as string;
}

function requireWorker(): FakeWorker {
  const worker = FakeWorker.current;
  if (!worker) throw new Error("worker not constructed");
  return worker;
}

describe("worker-client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("resolves demosaic with the demosaiced payload", async () => {
    const pending = run(demosaic(new ArrayBuffer(8), "image/x-raf"));
    await vi.waitFor(() => {
      if (!FakeWorker.current?.posted.length) throw new Error("not posted");
    });
    const worker = requireWorker();
    worker.reply({
      type: "demosaiced",
      requestId: requestIdOf(worker, "demosaic"),
      width: 2,
      height: 3,
      pixels: new Uint8ClampedArray(24),
    });

    const exit = await pending;
    expect(exit).toStrictEqual(
      Exit.succeed({
        width: 2,
        height: 3,
        pixels: new Uint8ClampedArray(24),
      }),
    );
  });

  it("fails worker errors as WorkerError", async () => {
    const pending = run(getExif(new ArrayBuffer(8), "image/x-raf"));
    await vi.waitFor(() => {
      if (!FakeWorker.current?.posted.length) throw new Error("not posted");
    });
    const worker = requireWorker();
    worker.reply({
      type: "error",
      requestId: requestIdOf(worker, "getExif"),
      message: "bad exif",
    });

    const exit = await pending;
    if (Exit.isSuccess(exit)) throw new Error("expected failure");
    const error = Cause.squash(exit.cause) as {
      _tag?: string;
      message?: string;
    };
    expect(error._tag).toBe("WorkerError");
    expect(error.message).toBe("bad exif");
  });

  it("fails call timeouts as WorkerError", async () => {
    const pending = run(parseRaw(new ArrayBuffer(8), "image/x-raf"));
    await vi.waitFor(() => {
      if (!FakeWorker.current?.posted.length) throw new Error("not posted");
    });
    const worker = requireWorker();
    expect(worker.posted.filter((m) => m.action !== "init")).toHaveLength(1);

    void vi.advanceTimersByTimeAsync(30_000);
    const exit = await pending;
    if (Exit.isSuccess(exit)) throw new Error("expected failure");
    const error = Cause.squash(exit.cause) as { _tag?: string };
    expect(error._tag).toBe("WorkerError");
  });

  it("fails init timeout as WorkerError", async () => {
    autoReady = false;
    try {
      const pending = run(parseRaw(new ArrayBuffer(8), "image/x-raf"));
      void vi.advanceTimersByTimeAsync(5_000);
      const exit = await pending;
      if (Exit.isSuccess(exit)) throw new Error("expected failure");
      const error = Cause.squash(exit.cause) as { _tag?: string };
      expect(error._tag).toBe("WorkerError");
    } finally {
      autoReady = true;
    }
  });
});
