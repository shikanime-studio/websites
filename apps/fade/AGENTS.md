# Fade

## Purpose

- Fade is a local image viewer powered by WebGPU (see \[README.md\](README.md)).
- Typical flows: pick a local directory, browse via filmstrip, preview
  fullscreen, navigate by keyboard, adjust rendering/lighting, read EXIF,
  preview Fujifilm RAF.

## URLs

- Production: `https://fade.shikanime.studio` (see
  \[wrangler.jsonc\](wrangler.jsonc))

## Commands

- Dev server: `pnpm dev` (Vite, port 3000)
- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`
- Install Playwright browsers (one-time): `pnpm exec playwright install`

## Deploy

- Cloudflare Workers: `pnpm deploy` (see \[wrangler.jsonc\](wrangler.jsonc))

## Configuration

- Required at runtime: `VITE_MIXPANEL_TOKEN`, `VITE_MIXPANEL_API_HOST` (used in
  \[\_\_root.tsx\](src/routes/\_\_root.tsx))

## Technical notes

- Stack: React + Tailwind, WebGPU shaders, TanStack Router + Query (see
  \[README.md\](README.md)).
- Browser support: requires a browser with WebGPU enabled/available.
