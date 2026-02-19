# Fade

Local image viewer powered by WebGPU.

## What it does

- Opens a local directory and lists media files in a filmstrip
- Renders images to a GPU canvas with lighting adjustments
- Supports fullscreen viewing and keyboard navigation
- Generates fast thumbnails and previews
- Reads EXIF and previews Fujifilm RAF (RAW) files

## How to use

- Use the folder button to pick a local directory
- Click a file to preview; double‑click to enter fullscreen
- Use arrow keys to navigate; Esc to exit fullscreen

## Tech

- React + Tailwind
- WebGPU (GPUCanvasContext, custom shaders)
- TanStack Router + Query
