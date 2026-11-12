import { describe, expect, it } from "vitest";
import * as raf from "./raf";
import { RafCfaHeaderDataView } from "./raf";

const tagIds = Object.entries(raf)
  .filter(([name, value]) => name.endsWith("TagId") && typeof value === "number")
  .map(([, value]) => value as number);

/** One-entry CFA header: the tag, its size, and enough payload to read from. */
function headerWith(tagId: number, size: number): RafCfaHeaderDataView<ArrayBuffer> {
  const bytes = new Uint8Array(64);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 1, false);
  view.setUint16(4, tagId, false);
  view.setUint16(6, size, false);
  bytes.fill(0x41, 8, 32); // readable payload for string and pair tags
  view.setUint16(8, 3, false);
  view.setUint16(10, 4, false);
  return new RafCfaHeaderDataView(bytes.buffer);
}

describe("rafCfaHeaderDataView tag coverage", () => {
  it("knows every declared Fuji tag", () => {
    expect(tagIds.length).toBeGreaterThan(25);
  });

  it.each(tagIds)("reads tag 0x%s", (tagId) => {
    const entries = headerWith(tagId, 2).getTagEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.tagId).toBe(tagId);
    expect(entries[0]?.value).not.toBeNull();
  });
});
