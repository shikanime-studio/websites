import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { DirectoryProvider } from "../components/DirectoryProvider";
import { Filmstrip } from "../components/Filmstrip";
import { GalleryProvider } from "../components/GalleryProvider";
import { CanvasInfoProvider } from "../components/CanvasInfoProvider";
import { MainViewer } from "../components/MainViewer";
import { Sidebar } from "../components/Sidebar";
import { ToolBar } from "../components/ToolBar";
import { useDirectory } from "../hooks/useDirectory";

export const Route = createFileRoute("/")({ component: App });

function GalleryContainer() {
  const { handle } = useDirectory();

  return (
    <GalleryProvider handle={handle}>
      <div className="bg-base-100 text-base-content selection:bg-warning selection:text-warning-content flex h-screen flex-col">
        <ToolBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <CanvasInfoProvider>
            <MainViewer />
            <Sidebar />
          </CanvasInfoProvider>
        </div>
        <Filmstrip />
      </div>
    </GalleryProvider>
  );
}

function App() {
  return (
    <DirectoryProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <span className="loading loading-spinner loading-lg text-warning"></span>
          </div>
        }
      >
        <GalleryContainer />
      </Suspense>
    </DirectoryProvider>
  );
}
