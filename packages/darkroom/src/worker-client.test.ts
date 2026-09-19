import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AnyMessage = Record<string, unknown>;

/**
 * Minimal Worker double: records posted messages, replays scripted
 * replies through the normal event path, counts message listeners so
 * tests can prove cleanup after timeouts.
 */
class FakeWorker extends EventTarget {
  static current: FakeWorker | null = null;

  posted: AnyMessage[] = [];
  listenerCount = 0;

  constructor() {
    super();
    FakeWorker.current = this;
  }

  postMessage(message: AnyMessage): void {
    this.posted.push(message);
  }

  terminate(): void {}

  override addEventListener(
    ...args: Parameters<EventTarget["addEventListener"]>
  ): void {
    super.addEventListener(...args);
    if (args[0] === "message") this.listenerCount++;
  }

  override removeEventListener(
    ...args: Parameters<EventTarget["removeEventListener"]>
  ): void {
    super.removeEventListener(...args);
    if (args[0] === "message") this.listenerCount--;
  }

  reply(message: AnyMessage): void {
    this.dispatchEvent(new MessageEvent("message", { data: message }));
  }
}

async function loadClient() {
  vi.resetModules();
  vi.stubGlobal("Worker", FakeWorker);
  return import("./worker-client");
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
    FakeWorker.current = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("resolves demosaic with the demosaiced payload", async () => {
    const mod = await loadClient();
    const client = mod.createImageWorkerClient();

    const pending = client.demosaic(new ArrayBuffer(8), "image/x-raf");
    const worker = requireWorker();
    worker.reply({
      type: "demosaiced",
      requestId: requestIdOf(worker, "demosaic"),
      width: 2,
      height: 3,
      pixels: new Uint8ClampedArray(24),
    });

    await expect(pending).resolves.toEqual({
      width: 2,
      height: 3,
      pixels: new Uint8ClampedArray(24),
    });
  });

  it("rejects worker errors as WorkerError", async () => {
    const mod = await loadClient();
    const client = mod.createImageWorkerClient();

    const pending = client.getExif(new ArrayBuffer(8), "image/x-raf");
    const worker = requireWorker();
    worker.reply({
      type: "error",
      requestId: requestIdOf(worker, "getExif"),
      message: "bad exif",
    });

    await expect(pending).rejects.toMatchObject({
      _tag: "WorkerError",
      message: "bad exif",
    });
  });

  it("rejects call timeouts as WorkerError and drops the listener", async () => {
    const mod = await loadClient();
    const client = mod.createImageWorkerClient();

    const pending = client.parseRaw(new ArrayBuffer(8), "image/x-raf");
    const worker = requireWorker();
    const before = worker.listenerCount;
    const rejection = expect(pending).rejects.toMatchObject({
      _tag: "WorkerError",
    });
    await vi.advanceTimersByTimeAsync(30_000);
    await rejection;
    expect(worker.listenerCount).toBe(before);
    expect(worker.posted).toHaveLength(1);
  });

  it("rejects init timeout as WorkerError", async () => {
    const mod = await loadClient();
    const client = mod.createImageWorkerClient();

    const pending = client.init();
    const rejection = expect(pending).rejects.toMatchObject({
      _tag: "WorkerError",
    });
    await vi.advanceTimersByTimeAsync(5_000);
    await rejection;
  });
});
