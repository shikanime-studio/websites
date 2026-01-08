import { FileQuestion } from "lucide-react";
import { useEffect, useRef } from "react";
import { useGallery } from "./GalleryContext";

export function Filmstrip() {
  const { files, selectedIndex, selectFile } = useGallery();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;

      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      const isVisible =
        selectedRect.left >= containerRect.left &&
        selectedRect.right <= containerRect.right;

      if (!isVisible) {
        selected.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedIndex]);

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
      <div className="flex h-full items-center gap-2 p-4">
        {files.map((fileItem, index) => (
          <button
            key={fileItem.url}
            ref={index === selectedIndex ? selectedRef : null}
            className={`bg-base-300 hover:border-base-content/50 relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
              index === selectedIndex
                ? "border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]"
                : "border-transparent"
            }`}
            onClick={() => selectFile(index)}
            aria-label={`Select ${fileItem.handle.name}`}
            aria-current={index === selectedIndex ? "true" : "false"}
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
                index === selectedIndex
                  ? "from-warning/20 bg-linear-to-t to-transparent"
                  : "bg-linear-to-t from-black/30 to-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
