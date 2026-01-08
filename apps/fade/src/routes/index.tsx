import { Filmstrip } from "../components/Filmstrip";
import { GalleryProvider } from "../components/GalleryContext";
import { MainViewer } from "../components/MainViewer";
import { Sidebar } from "../components/Sidebar";
import { ToolBar } from "../components/ToolBar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <GalleryProvider>
      <div className="bg-base-100 text-base-content selection:bg-warning selection:text-warning-content flex h-screen flex-col">
        <ToolBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <MainViewer />
          <Sidebar />
        </div>
        <Filmstrip />
      </div>
    </GalleryProvider>
  );
}
