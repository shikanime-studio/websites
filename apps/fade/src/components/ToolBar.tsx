import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Tooltip } from "@astryxdesign/core/Tooltip";
import { StudioHeader } from "@shikanime-studio/design";
import { AlertTriangle, FolderOpen, Image, Settings } from "lucide-react";
import { siGithub } from "simple-icons";
import { useDirectory } from "../hooks/useDirectory";
import { useGallery } from "../hooks/useGallery";
import { useModal } from "../hooks/useModal";
import { SettingsModal } from "./SettingsModal";

/** Fade runs the shared band in its compact density: an editor cannot spend
 *  64px on chrome, but the structure is the same as every other app. */
export function ToolBar() {
  const { modal, setModal } = useModal();

  return (
    <>
      <StudioHeader
        actions={
          <ToolBarActions
            onSettingsClick={() => {
              setModal("settings");
            }}
          />
        }
        brand={{
          name: "Fade",
          href: "/",
          mark: (
            <span className="studio-brand__mark text-warning flex items-center justify-center">
              <Image className="h-5 w-5" />
            </span>
          ),
        }}
        center={<ToolBarStatus />}
        density="compact"
      />

      <SettingsModal
        open={modal === "settings"}
        onClose={() => {
          setModal(undefined);
        }}
      />
    </>
  );
}

function ToolBarStatus() {
  const { files, selectedIndex } = useGallery();

  return (
    <span className="text-sm tabular-nums opacity-70">
      {files.length > 0 ? `${selectedIndex + 1} / ${files.length}` : ""}
    </span>
  );
}

function ToolBarActions({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { select, isSupported } = useDirectory();

  return (
    <div className="flex items-center gap-2">
      {!isSupported && (
        <Tooltip content="Browser support is limited" placement="below">
          <IconButton
            icon={<AlertTriangle className="text-warning h-5 w-5" />}
            label="Warning"
            size="sm"
            variant="ghost"
          />
        </Tooltip>
      )}
      <Button
        icon={<FolderOpen className="h-4 w-4" />}
        label="Open Folder"
        onClick={() => {
          void select();
        }}
        size="sm"
        variant="secondary"
      />
      <a
        aria-label="GitHub Repository"
        href="https://github.com/shikanime-studio/websites/tree/main/apps/fade"
        rel="noopener noreferrer"
        target="_blank"
      >
        <IconButton
          icon={
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d={siGithub.path} />
            </svg>
          }
          label="GitHub Repository"
          size="sm"
          variant="ghost"
        />
      </a>
      <IconButton
        icon={<Settings className="h-4.5 w-4.5" />}
        label="Settings"
        onClick={onSettingsClick}
        size="sm"
        variant="ghost"
      />
    </div>
  );
}
