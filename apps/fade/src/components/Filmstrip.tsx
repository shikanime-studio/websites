import { FileQuestion } from "lucide-react";
import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGallery } from "./GalleryContext";

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
            <button
              key={fileItem.url}
              className={`bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
                virtualItem.index === selectedIndex
                  ? "border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]"
                  : "border-transparent"
              }`}
              style={{
                transform: `translateX(${virtualItem.start}px)`,
                width: "80px", // Explicit width matching estimateSize - gap
              }}
              onClick={() => selectFile(virtualItem.index)}
              aria-label={`Select ${fileItem.handle.name}`}
              aria-current={
                virtualItem.index === selectedIndex ? "true" : "false"
              }
            >
              {fileItem.file.type.startsWith("image/") ? (
                <img
                  src={fileItem.url}
                  alt={fileItem.handle.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileQuestion className="h-8 w-8 opacity-50" />
                </div>
              )}
              <div
                className={`pointer-events-none absolute inset-0 ${
                  virtualItem.index === selectedIndex
                    ? "from-warning/20 bg-linear-to-t to-transparent"
                    : "bg-linear-to-t from-black/30 to-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
