import type { FileItem } from "@shikanime-studio/fs";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Slider as AstryxSlider } from "@astryxdesign/core/Slider";
import { Spinner } from "@astryxdesign/core/Spinner";
import { eq, useLiveQuery } from "@tanstack/react-db";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Sun,
} from "lucide-react";
import { Activity, Suspense } from "react";
import { useExif } from "@shikanime-studio/darkroom/react";
import { useFile } from "@shikanime-studio/darkroom/react";
import { useGallery } from "../hooks/useGallery";
import { useImageInfo } from "../hooks/useImageInfo";
import { useLighting } from "../hooks/useLighting";
import { settingsCollection } from "../lib/db";
import {
  ExifTagId,
} from "@shikanime-studio/darkroom";
import { formatBytes } from "../lib/intl";
import { FileIcon } from "./FileIcon";
import { Histogram } from "./Histogram";

export function Sidebar() {
  const { selectedFile } = useGallery();
  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "sidebarCollapsed"))
      .findOne(),
  );

  const isCollapsed = (data?.value as boolean) || false;

  return (
    <aside
      className={`bg-surface border-border relative shrink-0 border-l transition-all duration-250 ${
        isCollapsed ? "w-8" : "w-70"
      }`}
    >
      <IconButton
        className="border-border absolute top-1/2 -left-3 z-5 h-8 min-h-0 w-6 -translate-y-1/2 rounded-r-md border-r"
        variant="secondary"
        size="sm"
        label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={() => {
          if (data) {
            settingsCollection.update("sidebarCollapsed", (draft) => {
              draft.value = !isCollapsed;
            });
          } else {
            settingsCollection.insert({
              id: "sidebarCollapsed",
              value: !isCollapsed,
            });
          }
        }}
        icon={
          isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        }
      />

      <Activity mode={isCollapsed ? "hidden" : "visible"}>
        <div className="h-full overflow-y-auto p-4">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center py-10">
                <Spinner size="md" shade="subtle" />
              </div>
            }
          >
            {selectedFile ? (
              <SidebarContent fileItem={selectedFile} />
            ) : (
              <EmptySidebar />
            )}
          </Suspense>
        </div>
      </Activity>
    </aside>
  );
}

function EmptySidebar() {
  return (
    <p className="py-5 text-center text-sm opacity-50">No image selected</p>
  );
}

function SidebarContent({ fileItem }: { fileItem: FileItem }) {
  return (
    <>
      <GeneralSection fileItem={fileItem} />
      <LightingSection />
      <CameraSection fileItem={fileItem} />
      <GroupedFilesSection fileItem={fileItem} />
    </>
  );
}

function LightingSection() {
  const {
    exposure,
    setExposure,
    resetExposure,
    contrast,
    setContrast,
    resetContrast,
    saturation,
    setSaturation,
    resetSaturation,
    highlights,
    setHighlights,
    resetHighlights,
    shadows,
    setShadows,
    resetShadows,
    whites,
    setWhites,
    resetWhites,
    blacks,
    setBlacks,
    resetBlacks,
    tint,
    setTint,
    resetTint,
    temperature,
    setTemperature,
    resetTemperature,
    vibrance,
    setVibrance,
    resetVibrance,
    hue,
    setHue,
    resetHue,
  } = useLighting();

  return (
    <CollapsibleSection
      title="Lighting"
      id="sidebarSectionCollapsedLighting"
      icon={Sun}
      className="mt-8"
    >
      <div className="flex flex-col gap-4">
        <Slider
          label="Exposure"
          value={exposure}
          min={-5}
          max={5}
          step={0.05}
          onChange={setExposure}
          onDoubleClick={resetExposure}
        />
        <Slider
          label="Contrast"
          value={contrast}
          min={0}
          max={2}
          step={0.01}
          onChange={setContrast}
          onDoubleClick={resetContrast}
        />
        <Slider
          label="Saturation"
          value={saturation}
          min={0}
          max={2}
          step={0.01}
          onChange={setSaturation}
          onDoubleClick={resetSaturation}
        />
        <Slider
          label="Highlights"
          value={highlights}
          min={-1}
          max={1}
          step={0.01}
          onChange={setHighlights}
          onDoubleClick={resetHighlights}
        />
        <Slider
          label="Shadows"
          value={shadows}
          min={-1}
          max={1}
          step={0.01}
          onChange={setShadows}
          onDoubleClick={resetShadows}
        />
        <Slider
          label="Whites"
          value={whites}
          min={-1}
          max={1}
          step={0.01}
          onChange={setWhites}
          onDoubleClick={resetWhites}
        />
        <Slider
          label="Blacks"
          value={blacks}
          min={-1}
          max={1}
          step={0.01}
          onChange={setBlacks}
          onDoubleClick={resetBlacks}
        />
        <Slider
          label="Tint"
          value={tint}
          min={-1}
          max={1}
          step={0.01}
          onChange={setTint}
          onDoubleClick={resetTint}
        />
        <Slider
          label="Temperature"
          value={temperature}
          min={-1}
          max={1}
          step={0.01}
          onChange={setTemperature}
          onDoubleClick={resetTemperature}
        />
        <Slider
          label="Vibrance"
          value={vibrance}
          min={-1}
          max={1}
          step={0.01}
          onChange={setVibrance}
          onDoubleClick={resetVibrance}
        />
        <Slider
          label="Hue"
          value={hue}
          min={-1}
          max={1}
          step={0.01}
          onChange={setHue}
          onDoubleClick={resetHue}
        />
      </div>
    </CollapsibleSection>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onDoubleClick,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onDoubleClick?: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-1"
      onDoubleClick={() => {
        if (onDoubleClick) {
          onDoubleClick();
        }
      }}
    >
      <div className="flex justify-between">
        <label className="text-xs font-medium opacity-70">{label}</label>
        <span className="text-xs opacity-50">{value.toFixed(2)}</span>
      </div>
      <AstryxSlider
        label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        valueDisplay="none"
      />
    </div>
  );
}

function GeneralSection({ fileItem }: { fileItem: FileItem }) {
  const { handle } = fileItem;
  const { file } = useFile(fileItem);
  const { image } = useImageInfo();

  if (!file) return null;

  return (
    <CollapsibleSection
      title="Info"
      id="sidebarSectionCollapsedInfo"
      icon={Info}
    >
      <div className="bg-card rounded-lg mb-5 flex h-32 items-center justify-center overflow-hidden">
        {fileItem.mimeType?.startsWith("image/") ? (
          <Histogram />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileIcon type={fileItem.mimeType} className="h-8 w-8 opacity-50" />
          </div>
        )}
      </div>

      <dl className="m-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
            Filename
          </dt>
          <dd className="m-0 text-sm font-medium break-all" title={handle.name}>
            {handle.name}
          </dd>
        </div>

        {image && (
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
              Dimensions
            </dt>
            <dd className="m-0 text-sm font-medium">
              {image.naturalWidth} ×{image.naturalHeight}
            </dd>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
            File Size
          </dt>
          <dd className="m-0 text-sm font-medium">{formatBytes(file.size)}</dd>
        </div>
      </dl>
    </CollapsibleSection>
  );
}

function CameraSection({ fileItem }: { fileItem: FileItem }) {
  const exifData = useExif(fileItem);

  if (!exifData || exifData.length === 0) return null;

  const tags = Object.fromEntries(exifData.map((e) => [e.tagId, e.value]));

  const make = tags[ExifTagId.Make] as string | undefined;
  const model = tags[ExifTagId.Model] as string | undefined;
  const lensModel = tags[ExifTagId.LensModel] as string | undefined;
  const fNumber = tags[ExifTagId.FNumber] as number | undefined;
  const exposureTime = tags[ExifTagId.ExposureTime] as number | undefined;
  const iso = tags[ExifTagId.ISO] as number | undefined;
  const focalLength = tags[ExifTagId.FocalLength] as number | undefined;

  return (
    <CollapsibleSection
      title="Camera"
      id="sidebarSectionCollapsedCamera"
      icon={Camera}
      className="mt-8"
    >
      <dl className="m-0 flex flex-col gap-4">
        {(make ?? model) && (
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
              Camera
            </dt>
            <dd className="m-0 text-sm font-medium">
              {[make, model].filter(Boolean).join(" ")}
            </dd>
          </div>
        )}

        {lensModel && (
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
              Lens
            </dt>
            <dd className="m-0 text-sm font-medium">{lensModel}</dd>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {fNumber && (
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                Aperture
              </dt>
              <dd className="m-0 text-sm font-medium">
                f/
                {fNumber}
              </dd>
            </div>
          )}

          {exposureTime && (
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                Shutter
              </dt>
              <dd className="m-0 text-sm font-medium">
                {exposureTime >= 1
                  ? exposureTime
                  : `1/${Math.round(1 / exposureTime).toString()}`}
                s
              </dd>
            </div>
          )}

          {iso && (
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                ISO
              </dt>
              <dd className="m-0 text-sm font-medium">{iso}</dd>
            </div>
          )}

          {focalLength && (
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                Focal Length
              </dt>
              <dd className="m-0 text-sm font-medium">
                {focalLength}
                mm
              </dd>
            </div>
          )}
        </div>
      </dl>
    </CollapsibleSection>
  );
}

function GroupedFilesSection({ fileItem }: { fileItem: FileItem }) {
  const { sidecars } = fileItem;

  if (sidecars.length === 0) return null;

  return (
    <CollapsibleSection
      title="Grouped Files"
      id="sidebarSectionCollapsedGroupedFiles"
      className="mt-8"
    >
      <div className="flex flex-col gap-2">
        {sidecars.map((sidecarItem) => (
          <div
            key={sidecarItem.handle.name}
            className="flex items-center gap-2 text-sm opacity-70"
          >
            <FileIcon type={sidecarItem.mimeType} className="h-4 w-4" />
            <span className="truncate">{sidecarItem.handle.name}</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

function CollapsibleSection({
  title,
  id,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  id: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "sidebarCollapsed"))
      .findOne(),
  );
  const isCollapsed = (data?.value as boolean) || false;

  return (
    <div className={`${className} ${isCollapsed ? "hidden" : ""}`}>
      <CollapsibleHeading title={title} id={id} icon={Icon} />
      {children}
    </div>
  );
}

function CollapsibleHeading({
  title,
  id,
  icon: Icon,
}: {
  title: string;
  id: string;
  icon?: React.ElementType;
}) {
  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "sidebarCollapsed"))
      .findOne(),
  );
  const isCollapsed = (data?.value as boolean) || false;

  return (
    <button
      className="border-border flex w-full items-center justify-between border-b border-b-border bg-transparent px-0 py-2 text-left text-xs font-bold tracking-wider uppercase opacity-70 transition-colors"
      onClick={() => {
        if (data) {
          settingsCollection.update("sidebarCollapsed", (draft) => {
            draft.value = !isCollapsed;
          });
        } else {
          settingsCollection.insert({
            id: "sidebarCollapsed",
            value: !isCollapsed,
          });
        }
      }}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3 opacity-70" />}
        {title}
      </span>
      <ChevronDown
        className={`h-3 w-3 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
      />
    </button>
  );
}
