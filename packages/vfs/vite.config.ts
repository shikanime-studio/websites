import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        hooks: path.resolve(__dirname, 'src/hooks/index.ts'),
        providers: path.resolve(__dirname, 'src/providers/index.ts'),
      },
      formats: ['es'],
      fileName: (_format: string, entryName: string) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
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
