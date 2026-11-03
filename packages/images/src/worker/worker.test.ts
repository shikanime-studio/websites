import { describe, expect, it } from "vitest";
import { createImageWorkerClient } from "./client";
import { serveImageWorker } from "./entry";
import { handleImageRequest } from "./handler";

const exifFile = () => {
  // TIFF header + one Make entry, little-endian.
  const bytes = new Uint8Array(40);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0x4949, true);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, 1, true);
  view.setUint16(10, 0x010F, true);
  view.setUint16(12, 2, true);
  view.setUint32(14, 5, true);
  view.setUint32(18, 26, true);
  bytes.set([0x46, 0x75, 0x6A, 0x69, 0x00], 26);
  return new File([bytes], "fixture.tiff", { type: "image/tiff" });
};

describe("handleImageRequest", () => {
  it("reads EXIF through the codec", async () => {
    const output = await handleImageRequest({
      id: 1,
      kind: "exif",
      input: { file: exifFile(), mimeType: "image/tiff" },
    });
    expect(output).toEqual([{ tagId: 0x010F, value: "Fuji" }]);
  });

  it("rejects a payload the protocol does not describe", async () => {
    await expect(
      handleImageRequest({ id: 1, kind: "delete-everything" }),
    ).rejects.toThrow("Invalid image worker request");
    await expect(handleImageRequest(null)).rejects.toThrow(
      "Invalid image worker request",
    );
  });

  it("returns the plain bytes for a non-RAW preview", async () => {
    const file = exifFile();
    const output = await handleImageRequest({
      id: 2,
      kind: "preview",
      input: { file, mimeType: "image/tiff" },
    });
    expect(output).toMatchObject({ type: "image/tiff" });
    expect((output as { bytes: ArrayBuffer }).bytes.byteLength).toBe(40);
  });
});

/** A worker stand-in: one channel in (requests), one out (responses). */
function fakeWorker() {
  let requestListener: ((event: MessageEvent) => void) | undefined;
  const clientListeners: Array<(event: MessageEvent) => void> = [];

  // The worker side only talks to the client, never back to itself.
  const scope = {
    postMessage: (value: unknown) => {
      for (const listener of clientListeners) {
        listener({ data: value } as MessageEvent);
      }
    },
    addEventListener: (
      type: string,
      listener: (event: MessageEvent) => void,
    ) => {
      if (type === "message") requestListener = listener;
    },
  };
  serveImageWorker(scope);

  return {
    postMessage: (value: unknown) => {
      queueMicrotask(() => requestListener?.({ data: value } as MessageEvent));
    },
    addEventListener: (
      type: string,
      listener: (event: MessageEvent) => void,
    ) => {
      if (type === "message") clientListeners.push(listener);
    },
    removeEventListener: (
      _type: string,
      listener: (event: MessageEvent) => void,
    ) => {
      const index = clientListeners.indexOf(listener);
      if (index >= 0) clientListeners.splice(index, 1);
    },
    terminate: () => {},
  };
}

describe("client over a fake worker", () => {
  it("round-trips a request and matches the response to its id", async () => {
    const client = createImageWorkerClient(fakeWorker() as unknown as Worker);
    const output = await client.run("exif", {
      file: exifFile(),
      mimeType: "image/tiff",
    });
    expect(output).toEqual([{ tagId: 0x010F, value: "Fuji" }]);
    client.dispose();
  });

  it("runs concurrent requests without crossing answers", async () => {
    const client = createImageWorkerClient(fakeWorker() as unknown as Worker);
    const [first, second] = await Promise.all([
      client.run("preview", { file: exifFile(), mimeType: "image/tiff" }),
      client.run("exif", { file: exifFile(), mimeType: "image/tiff" }),
    ]);
    expect(first).toMatchObject({ type: "image/tiff" });
    expect(second).toEqual([{ tagId: 0x010F, value: "Fuji" }]);
    client.dispose();
  });
});
