# Websites

This repo hosts multiple Shikanime Studio web properties (public sites + apps),
managed as a pnpm workspace monorepo.

## Apps

- www: public-facing studio site (`https://shikanime.studio`)
- links: link hub / landing page (`https://links.shikanime.studio`)
- fade: local image viewer (WebGPU) (`https://fade.shikanime.studio`)
- reiya: merch/community site (`https://reiya.shikanime.studio`)

## Repo layout

- apps/\*: one deployable app per folder
- Each app has its own `wrangler.jsonc` and deploys to Cloudflare via Wrangler

## Quick start

- Install: `pnpm install`
- Run an app: `pnpm -C apps/<app> dev`

## Testing

- Unit tests (currently Fade’s Vitest suite): `pnpm -C apps/fade test`
- E2E (Fade, Playwright): `pnpm -C apps/fade test:e2e`

## Environment variables

- Astro apps use `PUBLIC_` env vars for client-side config
- Vite/React apps use `VITE_` env vars for client-side config
