# docs

Internal platform documentation for Shikanime Studio and Shikanime Labs,
built with Docusaurus and served as static assets from Cloudflare Workers.

## Develop

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```

Output lands in `build/` and is deployed via `wrangler deploy` (Workers
static assets, SPA fallback for client-side routing).

## Design tokens

Docs is a Docusaurus site, so it cannot mount the shared React shell. It maps
the same `--studio-*` contract onto Infima in `src/css/custom.css`: the 64px
band, the `#faf6f0` canvas, the `#cc4c0c` accent and Bricolage Grotesque for
the wordmark. Change the palette in `packages/design` and mirror it there.

## Structure

- `docs/platform` — orgs, repositories, web properties
- `docs/infrastructure` — hardware fleet, Nix fleet, Kubernetes, tailnet
- `docs/services` — cluster services and inference platform
- `docs/automation` — agent automation, A2A mesh, CI
