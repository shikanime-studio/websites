import { eq, useLiveQuery } from "@tanstack/react-db";
import { Camera, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Suspense } from "react";
import { settingsCollection } from "../lib/db";
import { useFile } from "../hooks/useFile";
import { useExif } from "../hooks/useExif";
import { useGallery } from "../hooks/useGallery";
import { formatBytes } from "../lib/intl";
import { useCanvasInfo } from "../hooks/useCanvasInfo";
import { FileIcon } from "./FileIcon";
import type { FileItem } from "../lib/fs";

export function Sidebar() {
  const { selectedFile } = useGallery();
  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "sidebar_collapsed"))
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
            settingsCollection.update("sidebar_collapsed", (draft) => {
              draft.value = !isCollapsed;
            });
          } else {
            settingsCollection.insert({
              id: "sidebar_collapsed",
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

      {!isCollapsed && (
        <div className="h-full overflow-y-auto p-4">
          <div className="border-base-300 text-base-content/70 mb-5 flex items-center gap-2 border-b pb-3">
            <Info className="h-4.5 w-4.5" />
            <h2 className="m-0 text-sm font-bold tracking-wide uppercase">
              Info
            </h2>
          </div>

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
              <p className="py-5 text-center text-sm opacity-50">
                No image selected
              </p>
            )}
          </Suspense>
        </div>
      )}
    </aside>
  );
}

function SidebarContent({ fileItem }: { fileItem: FileItem }) {
  const { handle, sidecars } = fileItem;
  const { file } = useFile(fileItem);
  const exifData = useExif(file ?? null);
  const { width, height } = useCanvasInfo();

  if (!file) return null;

  return (
    <div>
      <div className="bg-base-300 rounded-box mb-5 flex h-15 items-center justify-center">
        <FileIcon type={file.type} className="h-8 w-8 opacity-50" />
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

        {width && height && (
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
              Dimensions
            </dt>
            <dd className="m-0 text-sm font-medium">
              {width} × {height}
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

      {exifData && Object.keys(exifData).length > 0 && (
        <>
          <div className="border-base-300 text-base-content/70 mt-8 mb-5 flex items-center gap-2 border-b pb-3">
            <Camera className="h-4.5 w-4.5" />
            <h2 className="m-0 text-sm font-bold tracking-wide uppercase">
              Camera
            </h2>
          </div>

          <dl className="m-0 flex flex-col gap-4">
            {(exifData.make ?? exifData.model) && (
              <div className="flex flex-col gap-1">
                <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                  Camera
                </dt>
                <dd className="m-0 text-sm font-medium">
                  {[exifData.make, exifData.model].filter(Boolean).join(" ")}
                </dd>
              </div>
            )}

            {exifData.lensModel && (
              <div className="flex flex-col gap-1">
                <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                  Lens
                </dt>
                <dd className="m-0 text-sm font-medium">
                  {exifData.lensModel}
                </dd>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {exifData.fNumber && (
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                    Aperture
                  </dt>
                  <dd className="m-0 text-sm font-medium">
                    f/{exifData.fNumber}
                  </dd>
                </div>
              )}

              {exifData.exposureTime && (
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                    Shutter
                  </dt>
                  <dd className="m-0 text-sm font-medium">
                    {exifData.exposureTime >= 1
                      ? exifData.exposureTime
                      : `1/${Math.round(1 / exifData.exposureTime).toString()}`}
                    s
                  </dd>
                </div>
              )}

              {exifData.iso && (
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                    ISO
                  </dt>
                  <dd className="m-0 text-sm font-medium">{exifData.iso}</dd>
                </div>
              )}

              {exifData.focalLength && (
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                    Focal Length
                  </dt>
                  <dd className="m-0 text-sm font-medium">
                    {exifData.focalLength}mm
                  </dd>
                </div>
              )}
            </div>
          </dl>
        </>
      )}

      {sidecars.length > 0 && (
        <>
          <div className="border-base-300 text-base-content/70 mb-5 mt-8 flex items-center gap-2 border-b pb-3">
            <h2 className="m-0 text-sm font-bold tracking-wide uppercase">
              Grouped Files
            </h2>
          </div>
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
        </>
      )}
    </div>
  );
}
