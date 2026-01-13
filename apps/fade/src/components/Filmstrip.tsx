import { Activity, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGallery } from "../hooks/useGallery";
import { useElementSize } from "../hooks/useElementSize";
import { FilmstripItem } from "./FilmstripItem";

const ITEM_SIZE = 88;

export function Filmstrip() {
  const { files, selectedIndex, selectFile } = useGallery();
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(ref);

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: files.length,
    getScrollElement: () => ref.current,
    estimateSize: () => ITEM_SIZE,
    overscan: width > 0 ? Math.ceil(width / ITEM_SIZE) : 5,
  });

  // Scroll selected thumbnail into view
  useEffect(() => {
    virtualizer.scrollToIndex(selectedIndex, {
      align: "center",
      behavior: "smooth",
    });
  }, [selectedIndex, virtualizer]);

  if (files.length === 0) {
    return (
      <div className="bg-base-200 border-base-300 flex h-30 items-center justify-center border-t">
        <p className="m-0 text-sm opacity-50">Your files will appear here</p>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const modeMap = new Map(
    virtualItems.map((v) => [v.index, "visible" as const]),
  );

  return (
    <div
      className="bg-base-200 border-base-300 scrollbar-thin h-30 overflow-x-auto overflow-y-hidden border-t"
      ref={ref}
    >
      <div
        className="relative h-full w-full"
        style={{
          width: `${virtualizer.getTotalSize().toString()}px`,
        }}
      >
        {files.map((fileItem, index) => {
          const mode = modeMap.get(index) ?? "hidden";
          const start = index * ITEM_SIZE;

          return (
            <Activity mode={mode} key={fileItem.handle.name}>
              <FilmstripItem
                fileItem={fileItem}
                isSelected={index === selectedIndex}
                onClick={() => {
                  selectFile(index);
                }}
                style={{
                  transform: `translateX(${start.toString()}px)`,
                  width: "80px",
                }}
              />
            </Activity>
          );
        })}
      </div>
    </div>
  );
}
