import { settingsCollection } from "../lib/db";
import { getExifTags } from "../lib/exif";
import type { ExifTags } from "../lib/exif";
import { useGallery } from "./GalleryContext";
import { eq, useLiveQuery } from "@tanstack/react-db";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileQuestion,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Sidebar() {
  const { selectedFile } = useGallery();

  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "sidebar_collapsed")),
  );

  const isCollapsed = (data[0]?.value as boolean) || false;

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [exifData, setExifData] = useState<ExifTags | null>(null);

  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = selectedFile.url;

        getExifTags(selectedFile.file)
          .then(setExifData)
          .catch((err) => {
            console.error("Failed to parse EXIF:", err);
            setExifData(null);
          });
      } else {
        setDimensions(null);
        setExifData(null);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDimensions(null);
      setExifData(null);
    }
  }, [selectedFile]);

  return (
    <aside
      className={`bg-base-200 border-base-300 relative shrink-0 border-l transition-all duration-250 ${
        isCollapsed ? "w-8" : "w-70"
      }`}
    >
      <button
        className="btn btn-sm btn-square absolute top-1/2 -left-3 z-5 h-8 min-h-0 w-6 -translate-y-1/2 rounded-none rounded-l-md border-r-0"
        onClick={() =>
          settingsCollection.insert({
            id: "sidebar_collapsed",
            value: !isCollapsed,
          })
        }
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

          {selectedFile ? (
            <div>
              <div className="bg-base-300 rounded-box mb-5 flex h-15 items-center justify-center">
                {selectedFile.file.type.startsWith("image/") ? (
                  <FileImage className="h-8 w-8 opacity-50" />
                ) : (
                  <FileQuestion className="h-8 w-8 opacity-50" />
                )}
              </div>

              <dl className="m-0 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                    Filename
                  </dt>
                  <dd
                    className="m-0 text-sm font-medium break-all"
                    title={selectedFile.handle.name}
                  >
                    {selectedFile.handle.name}
                  </dd>
                </div>

                {dimensions && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                      Dimensions
                    </dt>
                    <dd className="m-0 text-sm font-medium">
                      {dimensions.width} × {dimensions.height}
                    </dd>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                    File Size
                  </dt>
                  <dd className="m-0 text-sm font-medium">
                    {formatFileSize(selectedFile.file.size)}
                  </dd>
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
                    {(exifData.make || exifData.model) && (
                      <div className="flex flex-col gap-1">
                        <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                          Camera
                        </dt>
                        <dd className="m-0 text-sm font-medium">
                          {[exifData.make, exifData.model]
                            .filter(Boolean)
                            .join(" ")}
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
                              : `1/${Math.round(1 / exifData.exposureTime)}`}
                            s
                          </dd>
                        </div>
                      )}

                      {exifData.iso && (
                        <div className="flex flex-col gap-1">
                          <dt className="text-[11px] font-bold tracking-wider uppercase opacity-50">
                            ISO
                          </dt>
                          <dd className="m-0 text-sm font-medium">
                            {exifData.iso}
                          </dd>
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
            </div>
          ) : (
            <p className="py-5 text-center text-sm opacity-50">
              No image selected
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
