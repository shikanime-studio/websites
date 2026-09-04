import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Tooltip } from "@astryxdesign/core/Tooltip";
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
      <header className="bg-body border-border flex h-12 min-h-12 items-center border-b px-4">
        <ToolBarLogo />
        <ToolBarStatus />
        <ToolBarActions
          onSettingsClick={() => {
            setModal("settings");
          }}
        />
      </header>

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
    <div className="flex items-center">
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
    <div className="flex flex-1 justify-center">
      {files.length > 0 && (
        <span className="text-sm tabular-nums opacity-70">
          {selectedIndex + 1} /{files.length}
        </span>
      )}
    </div>
  );
}

function ToolBarActions({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { select, isSupported } = useDirectory();

  return (
    <div className="flex items-center gap-2">
      {!isSupported && (
        <Tooltip content="Browser support is limited" placement="below">
          <IconButton
            variant="ghost"
            size="sm"
            label="Warning"
            icon={<AlertTriangle className="text-warning h-5 w-5" />}
          />
        </Tooltip>
      )}
      <Button
        variant="secondary"
        size="sm"
        label="Open Folder"
        icon={<FolderOpen className="h-4 w-4" />}
        onClick={() => {
          void select();
        }}
      />
      <a
        href="https://github.com/shikanime-studio/websites/tree/main/apps/fade"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub Repository"
      >
        <IconButton
          variant="ghost"
          size="sm"
          label="GitHub Repository"
          icon={
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d={siGithub.path} />
            </svg>
          }
        />
      </a>
      <IconButton
        variant="ghost"
        size="sm"
        label="Settings"
        icon={<Settings className="h-4.5 w-4.5" />}
        onClick={onSettingsClick}
      />
    </div>
  );
}
