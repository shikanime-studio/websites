import { useGallery } from "../hooks/useGallery";
import { RawImageViewer } from "./RawImageViewer";

export function MainViewer() {
  const { selectedFile } = useGallery();

  return selectedFile ? <RawImageViewer fileItem={selectedFile} /> : null;
}
