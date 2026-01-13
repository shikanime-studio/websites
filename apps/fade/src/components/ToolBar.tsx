import { AlertTriangle, FolderOpen, Image, Settings } from "lucide-react";
import { siGithub } from "simple-icons";
import { useDirectory } from "../hooks/useDirectory";
import { useGallery } from "../hooks/useGallery";
import { useModal } from "../hooks/useModal";
import { SettingsModal } from "./SettingsModal";

export function ToolBar() {
  const { modal, setModal } = useModal();

  return (
    <>
      <div className="navbar bg-base-100 border-base-300 h-12 min-h-12 border-b p-0 px-4">
        <ToolBarLogo />
        <ToolBarStatus />
        <ToolBarActions
          onSettingsClick={() => {
            setModal("settings");
          }}
        />
      </div>

      <SettingsModal
        open={modal === "settings"}
        onClose={() => {
          setModal(undefined);
        }}
      />
    </>
  );
}

function ToolBarLogo() {
  return (
    <div className="navbar-start">
      <div className="flex items-center gap-2">
        <Image className="text-warning h-5 w-5" />
        <span className="text-base font-semibold tracking-wide">Fade</span>
      </div>
    </div>
  );
}

function ToolBarStatus() {
  const { files, selectedIndex } = useGallery();

  return (
    <div className="navbar-center">
      {files.length > 0 && (
        <span className="text-sm tabular-nums opacity-70">
          {selectedIndex + 1} / {files.length}
        </span>
      )}
    </div>
  );
}

function ToolBarActions({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { select, isSupported } = useDirectory();

  return (
    <div className="navbar-end gap-2">
      {!isSupported && (
        <div
          className="tooltip tooltip-bottom tooltip-warning"
          data-tip="Browser support is limited"
        >
          <button
            className="btn btn-sm btn-ghost btn-square text-warning"
            aria-label="Warning"
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
        </div>
      )}
      <button
        className="btn btn-sm btn-outline btn-warning gap-2 font-medium"
        onClick={() => {
          void select();
        }}
      >
        <FolderOpen className="h-4 w-4" />
        <span>Open Folder</span>
      </button>
      <a
        href="https://github.com/shikanime-studio/websites/tree/main/apps/fade"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-square btn-ghost"
        aria-label="GitHub Repository"
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4.5 w-4.5 fill-current"
        >
          <title>{siGithub.title}</title>
          <path d={siGithub.path} />
        </svg>
      </a>
      <button
        className="btn btn-sm btn-square btn-ghost"
        onClick={onSettingsClick}
        aria-label="Settings"
      >
        <Settings className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
