import { FolderOpen, Image, Settings } from "lucide-react";
import { useState } from "react";
import { useDirectory } from "../hooks/useDirectory";
import { useGallery } from "../hooks/useGallery";
import { SettingsModal } from "./SettingsModal";

export function ToolBar() {
  const { select } = useDirectory();
  const { files, selectedIndex } = useGallery();
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
          {files.length > 0 && (
            <span className="text-sm tabular-nums opacity-70">
              {selectedIndex + 1} / {files.length}
            </span>
          )}
        </div>

        <div className="navbar-end gap-2">
          <button
            className="btn btn-sm btn-outline btn-warning gap-2 font-medium"
            onClick={() => {
              void select();
            }}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Open Folder</span>
          </button>
          <button
            className="btn btn-sm btn-square btn-ghost"
            onClick={() => {
              setIsSettingsOpen(true);
            }}
            aria-label="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
        }}
      />
    </>
  );
}
