import { eq, useLiveQuery } from "@tanstack/react-db";
import { Camera, ChevronDown, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Activity, Suspense, useState } from "react";
import { settingsCollection } from "../lib/db";
import { useFile } from "../hooks/useFile";
import { useExif } from "../hooks/useExif";
import { useGallery } from "../hooks/useGallery";
import { ExifTagId } from "../lib/exif";
import { formatBytes } from "../lib/intl";
import { useImageInfo } from "../hooks/useImageInfo";
import { FileIcon } from "./FileIcon";
import { Histogram } from "./Histogram";
import type { FileItem } from "../lib/fs";

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
      className={`bg-base-200 border-base-300 relative shrink-0 border-l transition-all duration-250 ${
        isCollapsed ? "w-8" : "w-70"
      }`}
    >
      <button
        className="btn btn-sm btn-square absolute top-1/2 -left-3 z-5 h-8 min-h-0 w-6 -translate-y-1/2 rounded-none rounded-l-md border-r-0"
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
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      <Activity mode={isCollapsed ? "hidden" : "visible"}>
        <div className="h-full overflow-y-auto p-4">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center py-10">
                <span className="loading loading-spinner loading-md opacity-50"></span>
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
      <CameraSection fileItem={fileItem} />
      <GroupedFilesSection fileItem={fileItem} />
    </>
  );
}

function GeneralSection({ fileItem }: { fileItem: FileItem }) {
  const { handle } = fileItem;
  const { file } = useFile(fileItem);
  const { image } = useImageInfo();

  if (!file) return null;

  return (
    <CollapsibleSection title="Info" icon={Info}>
      <div className="bg-base-300 rounded-box mb-5 flex h-32 items-center justify-center overflow-hidden">
        {fileItem.mimeType?.startsWith("image/") ? (
          <Histogram />
        ) : (
          <FileIcon type={fileItem.mimeType} className="h-8 w-8 opacity-50" />
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
              {image.naturalWidth} × {image.naturalHeight}
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
    <CollapsibleSection title="Camera" icon={Camera} className="mt-8">
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
              <dd className="m-0 text-sm font-medium">f/{fNumber}</dd>
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
              <dd className="m-0 text-sm font-medium">{focalLength}mm</dd>
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
    <CollapsibleSection title="Grouped Files" className="mt-8">
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
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={className}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="border-base-300 text-base-content/70 mb-5 flex w-full items-center justify-between border-b pb-3 outline-none"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4.5 w-4.5" />}
          <h2 className="m-0 text-sm font-bold tracking-wide uppercase">
            {title}
          </h2>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronRight className="h-4 w-4 opacity-50" />
        )}
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
