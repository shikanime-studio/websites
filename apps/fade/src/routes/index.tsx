import { Spinner } from "@astryxdesign/core/Spinner";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import { Filmstrip } from "../components/Filmstrip";
import { MainViewer } from "../components/MainViewer";
import { Sidebar } from "../components/Sidebar";
import { ToolBar } from "../components/ToolBar";
import { useDirectory } from "../hooks/useDirectory";
import { useGallery } from "../hooks/useGallery";
import { useKeymap } from "../hooks/useKeymap";

export const Route = createFileRoute("/")({
  component: App,
  validateSearch: z.object({
    modal: z.enum(["settings", "fullscreen"]).optional(),
  }),
});

function GalleryContainer() {
  useDirectory();
  const gallery = useGallery();

  useKeymap("navigateNext", () => {
    if (gallery.files.length === 0) return;
    gallery.navigateNext();
  });
  useKeymap("navigatePrevious", () => {
    if (gallery.files.length === 0) return;
    gallery.navigatePrevious();
  });
  useKeymap("selectFirst", () => {
    if (gallery.files.length === 0) return;
    gallery.selectFile(0);
  });
  useKeymap("selectLast", () => {
    if (gallery.files.length === 0) return;
    gallery.selectFile(gallery.files.length - 1);
  });

  return (
    <div className="bg-body text-secondary selection:bg-warning selection:text-on-warning flex h-screen flex-col">
      <ToolBar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <MainViewer />
        <Sidebar />
      </div>
      <Filmstrip />
    </div>
  );
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <GalleryContainer />
    </Suspense>
  );
}
