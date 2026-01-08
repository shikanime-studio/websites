import { useGallery } from "./GalleryContext";
import { SettingsModal } from "./SettingsModal";
import { FolderOpen, Image, Settings } from "lucide-react";
import { useState } from "react";

export function ToolBar() {
  const { loadDirectory, images, selectedIndex, isLoading } = useGallery();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="navbar bg-base-100 border-base-300 h-12 min-h-12 border-b p-0 px-4">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <Image className="text-warning h-5 w-5" />
            <span className="text-base font-semibold tracking-wide">Fade</span>
          </div>
        </div>

        <div className="navbar-center">
          {images.length > 0 && (
            <span className="text-sm tabular-nums opacity-70">
              {selectedIndex + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="navbar-end gap-2">
          <button
            className="btn btn-sm btn-outline btn-warning gap-2 font-medium"
            onClick={loadDirectory}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <FolderOpen className="h-4 w-4" />
            )}
            <span>{isLoading ? "Loading..." : "Open Folder"}</span>
          </button>
          <button
            className="btn btn-sm btn-square btn-ghost"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
