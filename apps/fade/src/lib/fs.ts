import type { FileItem } from "../hooks/useGallery";

export async function scanDirectory(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<Array<FileItem>> {
  const groups = new Map<string, Array<FileSystemFileHandle>>();

  for await (const handle of directoryHandle.values()) {
    if (handle.kind === "file") {
      const name = handle.name;
      const lastDotIndex = name.lastIndexOf(".");
      const basename =
        lastDotIndex === -1 ? name : name.substring(0, lastDotIndex);

      let group = groups.get(basename);
      if (!group) {
        group = [];
        groups.set(basename, group);
      }
      group.push(handle);
    }
  }

  const items: Array<FileItem> = [];
  const RASTER_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

  for (const handles of groups.values()) {
    let primaryHandle = handles[0];
    let bestScore = -1;

    for (const handle of handles) {
      const ext = handle.name.split(".").pop()?.toLowerCase() ?? "";
      const score = RASTER_EXTENSIONS.has(ext) ? 2 : 1;

      if (score > bestScore) {
        bestScore = score;
        primaryHandle = handle;
      }
    }

    const sidecars = handles.filter((h) => h !== primaryHandle);
    sidecars.sort((a, b) => a.name.localeCompare(b.name));

    items.push({
      handle: primaryHandle,
      sidecars,
    });
  }

  // Sort by filename
  items.sort((a, b) => a.handle.name.localeCompare(b.handle.name));

  return items;
}
