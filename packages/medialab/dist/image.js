import { ExifDataView as t } from "./exif.js";
import { JpegDataView as r } from "./jpeg.js";
import { PngDataView as i } from "./png.js";
import { createRafDataView as f } from "./raf.js";
import { TiffDataView as m } from "./tiff.js";
import { WebPDataView as n } from "./webp.js";
class w extends m {
  getExif() {
    return new t(this.buffer, this.byteOffset, this.byteLength);
  }
}
async function l(e) {
  const a = await e.handle.getFile();
  switch (e.mimeType) {
    case "image/jpeg":
      return new r(await a.arrayBuffer());
    case "image/png":
      return new i(await a.arrayBuffer());
    case "image/webp":
      return new n(await a.arrayBuffer());
    case "image/tiff":
      return new w(await a.arrayBuffer());
    case "image/x-fujifilm-raf":
      return await f(e);
    default:
      return null;
  }
}
export {
  l as createImageDataView
};
//# sourceMappingURL=image.js.map
