# hikari

Cosplay photoshoot commission planner inspired by ImaCoCoS: request a
shoot, agree on place and time, receive the photos, track every step.

## URLs

- Production: `https://hikari.shikanime.studio`

## Commands

- Dev server: `pnpm dev`
- Typecheck: `pnpm check`
- Self-check: `pnpm test`
- Preview: `pnpm preview`

## Deploy

- Cloudflare Workers: `pnpm deploy` (see [wrangler.jsonc](wrangler.jsonc))

## Data

- D1 binding: `DB` (commissions, notifications)
- R2 binding: `PHOTOS` (delivery photos)
- Migrations: `pnpm db:generate` then `pnpm db:migrate`

## Configuration

- Server secrets (Cloudflare): `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`
  (see [env.d.ts](src/env.d.ts))
- Client env: `VITE_PUBLIC_GOOGLE_CLIENT_ID`, `VITE_SITE`

## Technical notes

- Commission lifecycle is validated in `src/lib/hikari.ts`
  (`requested → accepted → scheduled → completed → delivered`).
- Google Maps is a keyless embed iframe; Google Calendar is a render-URL
  template link. No SDKs.
- Photos go to R2 under `commissions/<id>/<photo>.<ext>`; the first
  upload on a completed commission marks delivery ready and notifies
  the client in-app.
