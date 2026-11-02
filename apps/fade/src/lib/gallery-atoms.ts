import type { FileItem } from "./fs";
import { Effect } from "effect";
import { isSuccess } from "effect/reactivity/AsyncResult";
import { make, writable } from "effect/reactivity/Atom";
import { galleryAtom } from "./photo-atoms";
import { directoryHandleAtom, selectedIndexAtom } from "./ui-atoms";

export interface GalleryView {
  files: Array<FileItem>;
  selectedIndex: number;
  selectedFile: FileItem | null;
}

/** True when `index` points at an entry of `count` items. */
const clampIndex = (index: number, count: number): number =>
  Math.max(0, Math.min(index, count - 1));

/**
 * The listing as a plain array, readable from a write context. Before the
 * scan settles there is nothing to show yet, so it answers with no files.
 */
export const galleryFilesAtom = make((get) => {
  const handle = get(directoryHandleAtom);
  const result = get(galleryAtom(handle));
  return isSuccess(result) ? (result.value ?? []) : [];
});

/**
 * What the gallery shows, as an async atom so the viewer keeps suspending
 * until the directory scan settles. The index is clamped here rather than in a
 * hook, so a directory that shrinks can never leave the viewer on a missing
 * file.
 */
export const galleryViewAtom = make((get) =>
  Effect.gen(function* () {
    const handle = get(directoryHandleAtom);
    const scanned = yield* get.result(galleryAtom(handle));
    const files = scanned ?? [];
    const stored = get(selectedIndexAtom);
    const selectedIndex = clampIndex(stored, files.length);
    return {
      files,
      selectedIndex,
      selectedFile: files[selectedIndex] ?? null,
    } satisfies GalleryView;
  }),
);

export type GalleryAction =
  | { readonly _tag: "select"; readonly index: number }
  | { readonly _tag: "next" }
  | { readonly _tag: "previous" };

/** Index transitions, clamped against the listing the viewer is looking at. */
export const galleryActionAtom = writable(
  (get) => get(selectedIndexAtom),
  (ctx, action: GalleryAction) => {
    const count = ctx.get(galleryFilesAtom).length;
    const current = ctx.get(selectedIndexAtom);
    const target
      = action._tag === "select"
        ? action.index
        : action._tag === "next"
          ? current + 1
          : current - 1;
    ctx.set(selectedIndexAtom, clampIndex(target, count));
  },
);
