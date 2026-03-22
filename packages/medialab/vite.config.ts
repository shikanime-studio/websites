import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        'exif': path.resolve(__dirname, 'src/exif.ts'),
        'hooks/exif': path.resolve(__dirname, 'src/hooks/exif.ts'),
        'hooks/gpu': path.resolve(__dirname, 'src/hooks/gpu.ts'),
        'hooks/image': path.resolve(__dirname, 'src/hooks/image.ts'),
        'hooks/raf': path.resolve(__dirname, 'src/hooks/raf.ts'),
        'image': path.resolve(__dirname, 'src/image.ts'),
        'jpeg': path.resolve(__dirname, 'src/jpeg.ts'),
        'png': path.resolve(__dirname, 'src/png.ts'),
        'providers/GpuAdapterProvider': path.resolve(__dirname, 'src/providers/GpuAdapterProvider.tsx'),
        'providers/GpuDeviceProvider': path.resolve(__dirname, 'src/providers/GpuDeviceProvider.tsx'),
        'raf': path.resolve(__dirname, 'src/raf.ts'),
        'tiff': path.resolve(__dirname, 'src/tiff.ts'),
        'utils': path.resolve(__dirname, 'src/utils.ts'),
        'webp': path.resolve(__dirname, 'src/webp.ts'),
      },
      formats: ['es'],
      fileName: (_format: string, entryName: string) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        '@tanstack/react-query',
        'react',
      ],
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    target: 'es2022',
  },
})
