export function isFileSystemAPISupported(): boolean {
  if (typeof window === "undefined") return false;
  return "showOpenFilePicker" in window;
}
