import { Image } from "@unpic/react";
import { Suspense } from "react";
import { useThumbnail } from "../hooks/useThumbnail";
import { FileIcon } from "./FileIcon";
import type { FileItem } from "../lib/fs";

interface FilmstripItemProps {
  fileItem: FileItem;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

export function FilmstripItem(props: FilmstripItemProps) {
  return (
    <Suspense fallback={<FilmstripItemSkeleton {...props} />}>
      <FilmstripItemContent {...props} />
    </Suspense>
  );
}

function FilmstripItemSkeleton({
  fileItem,
  isSelected,
  onClick,
  style,
}: FilmstripItemProps) {
  const { handle } = fileItem;
  return (
    <button
      className={`bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
        isSelected
          ? "border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]"
          : "border-transparent"
      }`}
      style={style}
      onClick={onClick}
      aria-label={`Select ${handle.name}`}
      aria-current={isSelected ? "true" : "false"}
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="loading loading-spinner loading-md opacity-50"></span>
      </div>
    </button>
  );
}

function FilmstripItemContent({
  fileItem,
  isSelected,
  onClick,
  style,
}: FilmstripItemProps) {
  const { handle } = fileItem;
  const { mimeType, url } = useThumbnail(fileItem, 80, 80);

  return (
    <button
      className={`bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
        isSelected
          ? "border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]"
          : "border-transparent"
      }`}
      style={style}
      onClick={onClick}
      aria-label={`Select ${handle.name}`}
      aria-current={isSelected ? "true" : "false"}
    >
      {url && mimeType.startsWith("image/") ? (
        <Image
          src={url}
          alt={handle.name}
          className="h-full w-full object-cover"
          layout="constrained"
          width={80}
          height={80}
          background="auto"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FileIcon type={mimeType} className="h-8 w-8 opacity-50" />
        </div>
      )}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isSelected
            ? "from-warning/20 bg-linear-to-t to-transparent"
            : "bg-linear-to-t from-black/30 to-transparent"
        }`}
      />
    </button>
  );
}
