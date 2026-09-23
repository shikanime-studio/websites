import { describe, expect, it } from "vitest";
import { groupByPrimary } from "./fs";
import type { FileItem } from "./fs";

function item(name: string, mimeType?: string): FileItem {
  return {
    name,
    mimeType,
    handle: {
      name,
      kind: "file",
      getFile: () => Promise.reject(new Error("unused")),
      createWritable: () => Promise.reject(new Error("unused")),
      isFile: true,
      isSameEntry: () => Promise.resolve(false),
      createWritableSyncAccessHandle: undefined,
    } as unknown as FileSystemFileHandle,
    sidecars: [],
  };
}

describe("groupByPrimary", () => {
  it("keeps the image as primary and sorts sidecars under it", () => {
    const raf = item("DSCF1000.RAF", "image/x-fujifilm-raf");
    const xmp = item("DSCF1000.xmp", "application/rdf+xml");

    const result = groupByPrimary([xmp, raf]);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("DSCF1000.RAF");
    expect(result[0]?.sidecars.map((sidecar) => sidecar.name)).toEqual([
      "DSCF1000.xmp",
    ]);
  });

  it("breaks score ties by first appearance", () => {
    const jpg = item("DSCF1000.JPG", "image/jpeg");
    const raf = item("DSCF1000.RAF", "image/x-fujifilm-raf");

    const result = groupByPrimary([jpg, raf]);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("DSCF1000.JPG");
  });

  it("falls back to the first item when no primary scores higher", () => {
    const a = item("notes.txt", "text/plain");
    const b = item("notes.md", "text/markdown");

    const result = groupByPrimary([a, b]);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("notes.txt");
    expect(result[0]?.sidecars).toEqual([b]);
  });

  it("returns results sorted by name across groups", () => {
    const result = groupByPrimary([
      item("b.RAF", "image/x-fujifilm-raf"),
      item("a.RAF", "image/x-fujifilm-raf"),
    ]);

    expect(result.map((file) => file.name)).toEqual(["a.RAF", "b.RAF"]);
  });
});
