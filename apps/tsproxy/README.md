# tsproxy

Cloudflare Worker reverse proxy to a Tailscale Funnel origin.

## Upstream

Default upstream:

- <https://copyparty.taila659a.ts.net/>

Override the upstream host by setting the Worker env var:

- `TARGET_HOST` (example: `copyparty.taila659a.ts.net`)

## Local Dev

```bash
npm install
npm run dev
```

Set `TARGET_HOST` using Wrangler variables (for example via `.dev.vars`).

## Deploy

```bash
npm run deploy
```
