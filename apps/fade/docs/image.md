# File Layouts + DataViews (JPEG / PNG / WebP / TIFF / RAF)

This project uses small `DataView`-based parsers to extract EXIF (TIFF/IFD) metadata from container formats, and to read RAF-specific blocks (preview JPEG, Fuji tag block, CFA payload).

## Common primitives

### TIFF container core (endianness, tags, IFDs)

TIFF mechanics (endianness marker, magic number, IFD offsets, tag read/write helpers) are implemented by:

- `TiffDataView`: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/tiff.ts

### EXIF reader (IFD traversal + selected tags)

EXIF is a TIFF/IFD structure; `ExifDataView` extends the TIFF helpers and adds “walk IFDs and collect tags”:

- `ExifDataView`: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/exif.ts

Conceptually in this repo:

- **TIFF** = container mechanics + primitive tag access
- **EXIF** = tag traversal / extraction policy on top of TIFF

## JPEG (.jpg)

### Binary layout (simplified)

- SOI marker: `0xFFD8`
- Repeating segments:
  - APP1 segment: `0xFFE1`
    - length (2 bytes)
    - `"Exif\0\0"`
    - TIFF header + IFDs (this is what `ExifDataView` parses)
- Compressed image data (scan)

### DataViews

- Whole file: `JpegDataView` (`getExif()` scans markers and returns the EXIF payload)
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/img.ts

## PNG (.png)

### Binary layout (simplified)

- 8-byte PNG signature
- Repeating chunks:
  - `[length][type][data][crc]`
  - EXIF is stored in an `eXIf` chunk (payload is TIFF header + IFDs)

### DataViews

- Whole file: `PngDataView` (`getExif()` finds `eXIf` chunk and returns its payload)
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/img.ts

## WebP (.webp)

### Binary layout (simplified)

WebP is a RIFF container:

- `"RIFF"` + file size (LE) + `"WEBP"`
- Repeating chunks:
  - `[chunkId][chunkSize LE][chunkData][padding?]`
  - EXIF is stored in an `"EXIF"` chunk (payload is TIFF header + IFDs)

### DataViews

- Whole file: `WebPDataView` (`getExif()` finds `EXIF` chunk and returns its payload)
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/img.ts

## TIFF (.tiff)

### Binary layout (simplified)

- TIFF header:
  - endianness: `"II"` or `"MM"`
  - magic: `42`
  - first IFD offset
- IFD chain:
  - entryCount, N entries, nextIFDOffset
- Pixel data stored as strips/tiles referenced by IFD tags

### DataViews

- TIFF core container: `TiffDataView`
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/tiff.ts
- TIFF as an `ImageDataView`:
  - `TiffImageDataView` is an internal wrapper that implements `getExif()` by returning `ExifDataView` over the same bytes
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/img.ts

## RAF (.raf, Fujifilm RAW)

In this repo, RAF is treated as a proprietary header with offsets pointing to multiple blocks:

- a preview JPEG block (standard JPEG)
- a Fuji tag block (custom tag records)
- a CFA payload block (either raw bytes or a TIFF container)

### Binary layout (as modeled here)

- RAF header (Fuji proprietary, big-endian offset/length fields at fixed positions)
  - `JpegImageOffset`, `JpegImageLength`
  - `CfaHeaderOffset`, `CfaHeaderLength`
  - `CfaOffset`, `CfaLength`
- Preview block
  - Standard JPEG bytes at `JpegImageOffset` / `JpegImageLength`
- Fuji tag block (“CFA header” block in code naming)
  - `u32 count (BE)`
  - repeated `count` times:
    - `u16 tagId (BE)`
    - `u16 size (BE)`
    - `size bytes data`
- CFA payload block
  - bytes at `CfaOffset` / `CfaLength`
  - may be:
    - raw raster bytes (fast path by matching expected lengths), OR
    - a TIFF container (IFD+strips) describing the CFA raster

### DataViews and block mapping

- Whole RAF: `RafDataView`
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/raf.ts

#### Preview JPEG block

- `RafDataView.getJpegImage()` → `JpegDataView`
- `JpegDataView.getExif()` → `ExifDataView` over the APP1 EXIF payload
  - Sources:
    - RAF wrapper: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/raf.ts
    - JPEG parser: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/img.ts

#### Fuji tag block (“CFA header” tags)

- `RafDataView.getCfaHeader()` → `CfaHeaderDataView`
- `CfaHeaderDataView.getTagEntries()` parses the Fuji private tag records
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/raf.ts

#### CFA payload block

- `RafDataView.getCfa()` → `CfaDataView` (extends `TiffDataView`)
- `CfaDataView.getRaster(width,height)`:
  - fast-path: raw 16-bit or packed 14-bit lengths
  - otherwise: parses as TIFF (tags + strips)
  - Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/raf.ts

## Factory functions (how views are created)

### Image formats (jpeg/png/webp/tiff)

`createImageDataView(mimeType)` returns the matching `*DataView`:

- Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/img.ts

### RAF / raw formats

`createRafDataView` and `createRawImageDataView` return `RafDataView`:

- Source: https://github.com/shikanime-studio/websites/blob/main/apps/fade/src/lib/raw.ts

## Quick mapping: “format → view → sub-views”

- JPEG → `JpegDataView` → `getExif()` → `ExifDataView`
- PNG → `PngDataView` → `getExif()` → `ExifDataView`
- WebP → `WebPDataView` → `getExif()` → `ExifDataView`
- TIFF → `TiffImageDataView` → `getExif()` → `ExifDataView` (same bytes)
- RAF → `RafDataView`
  - `getJpegImage()` → `JpegDataView` → `getExif()` → `ExifDataView`
  - `getCfaHeader()` → `CfaHeaderDataView`
  - `getCfa()` → `CfaDataView` → `getRaster()`
