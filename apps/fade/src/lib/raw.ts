export async function parseRaf(file: File): Promise<Blob | null> {
  const header = await file.slice(0, 100).arrayBuffer();
  const view = new DataView(header);

  // Check if header is large enough to contain offsets
  if (view.byteLength < 88) return null;

  // Offset to JPEG Image Offset is at 84 (Big Endian)
  const jpegOffset = view.getUint32(84, false);
  // Length of JPEG Image is at 88 (Big Endian)
  const jpegLength = view.getUint32(88, false);

  if (jpegOffset > 0 && jpegLength > 0) {
    return file.slice(jpegOffset, jpegOffset + jpegLength, "image/jpeg");
  }

  return null;
}
