import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGallery } from "./GalleryContext";
import { FilmstripItem } from "./FilmstripItem";

export function Filmstrip() {
  const { files, selectedIndex, selectFile } = useGallery();
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: files.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 88, // 80px width + 8px gap
    overscan: 5,
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

  return (
    <div
      className="bg-base-200 border-base-300 scrollbar-thin h-30 overflow-x-auto overflow-y-hidden border-t"
      ref={containerRef}
    >
      <div
        className="relative h-full w-full"
        style={{
          width: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const fileItem = files[virtualItem.index];
          return (
            <FilmstripItem
              key={fileItem.handle.name}
              handle={fileItem.handle}
              isSelected={virtualItem.index === selectedIndex}
              onClick={() => selectFile(virtualItem.index)}
              style={{
                transform: `translateX(${virtualItem.start}px)`,
                width: "80px",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
