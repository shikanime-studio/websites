import { Image } from "@unpic/react";
import { useFile } from "../hooks/useFile";
import { FileIcon } from "./FileIcon";

interface FilmstripItemProps {
  handle: FileSystemFileHandle;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

export function FilmstripItem({
  handle,
  isSelected,
  onClick,
  style,
}: FilmstripItemProps) {
  const { file, url } = useFile(handle);

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
      {url && file?.type?.startsWith("image/") ? (
        <Image
          src={url}
          alt={handle.name}
          className="h-full w-full object-cover"
          layout="fullWidth"
          background="auto"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FileIcon type={file?.type} className="h-8 w-8 opacity-50" />
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
