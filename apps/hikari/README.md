# Hikari

The photographer's console for cosplay shoots. Cosplayers commission a
session through a short form; the photographer accepts, schedules the
date and place, shoots, and delivers — while the client and the invited
crew follow everything on one private link. Inspired by
[ImaCoCoS](https://omiomi79.github.io/imacocos/).

### Who uses it

| Role | What they do |
| ----- | ------------ |
| Photographer | runs the board: accepts requests, schedules, advances status, uploads photos, shares the recap |
| Cosplayer (client) | requests the shoot, agrees the date and place, follows progress to delivery |
| Crew (models, helpers) | receive the calendar invite and open the recap link |

**Live:** <https://hikari.shikanime.studio>

## What it does

- **Request** (`/commissions/new`, client): title, character, date/time with
  timezone, a place picked from autocomplete (Google Places when
  `GOOGLE_MAPS_API_KEY` is set, OpenStreetMap otherwise — free text is
  rejected so the map and calendar are always real), invitees as
  `Name <email>` lines.
- **Run** (`/commissions/$id`, photographer): accept, advance status,
  upload photos to R2, copy the share link, and hand over the Google
  Calendar link and `.ics` carrying guests and the address. The client
  sees the same page read-only.
- **Share** (`/s/<token>`): public recap, no session required — the
  token is the capability. Date and time in the commission timezone,
  place with a map link, crew, an honest progress timeline (Booked →
  Scheduled → Shoot day → Processing → Preview → Delivery), and the
  gallery served through token-scoped endpoints only. Unknown tokens 404.
- **Identity**: signs in through the Accounts Center (generic OAuth,
  account linking by verified email) with Google as fallback.
- **Landing** (`/`): explains the service in one screen — three steps,
  a mock recap, one CTA — in EN/FR/JA.

## Stack

| Layer   | Choice                                                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI      | React 19 + TanStack Router/Start (SSR) + Astryx design system with bespoke `--hk-*` warm tokens                                                               |
| State   | Effect atoms (`@effect/atom-react`); async flows are `Effect.gen` with `Effect.ensuring` for busy flags; errors surface through the shared Astryx toast stack |
| Data    | D1 (Drizzle ORM), R2 bucket `PHOTOS` for uploads                                                                                                              |
| i18n    | `src/i18n/messages.ts` (en/fr/ja), `useTranslator`                                                                                                            |
| Runtime | Cloudflare Workers via `@cloudflare/vite-plugin`                                                                                                              |

## Routes

| Route                                                        | Purpose                                               |
| ------------------------------------------------------------ | ----------------------------------------------------- |
| `/`                                                          | landing (signed-out) or commissions board (signed-in) |
| `/commissions/new`                                           | booking form with location autocomplete + invitees    |
| `/commissions/$id`                                           | detail: status, share link, calendar, uploads         |
| `/s/$token`                                                  | public recap + gallery                                |
| `/api/commissions`, `/api/commissions/$id/photos[/$photoId]` | authenticated API                                     |
| `/api/share/$token/photos`, `/api/share/$token/calendar`     | token-scoped public endpoints                         |
| `/api/places`                                                | place autocomplete proxy (Google or OSM)              |

## Develop

```sh
pnpm install            # repo root
pnpm dev -- --port 3102 # accounts dev must be on 3101
pnpm check              # tsc --noEmit
pnpm lint               # eslint
pnpm test               # unit (Vitest)
pnpm check:fixtures     # pure-function fixture check (tsx)
pnpm test:e2e           # Playwright smoke (landing, booking form)
pnpm build              # production build
```

Local D1: `printf 'y\n' | pnpm exec wrangler d1 migrations apply hikari --local`.
Sign-in needs the accounts dev server on 3101
(`VITE_ACCOUNTS_SITE=http://localhost:3101`), a registered localhost
redirect for client `hikari`, and `ACCOUNTS_CLIENT_SECRET` in
`.dev.vars`.

## Environment

| Name                     | Where                | Purpose                                   |
| ------------------------ | -------------------- | ----------------------------------------- |
| `BETTER_AUTH_SECRET`     | secret / `.dev.vars` | session signing                           |
| `GOOGLE_CLIENT_SECRET`   | secret / `.dev.vars` | Google fallback provider                  |
| `ACCOUNTS_CLIENT_SECRET` | secret / `.dev.vars` | Accounts Center OAuth client              |
| `GOOGLE_MAPS_API_KEY`    | secret (optional)    | Places autocomplete; OSM otherwise        |
| `VITE_SITE`              | build env            | canonical origin baked into the bundle    |
| `VITE_ACCOUNTS_SITE`     | build env            | accounts origin for discovery (dev: 3101) |

## Data model (D1)

`commissions` (title, description, status, photographer/client ids,
character, shooting date + timezone, validated location name/query/
lat/lng, unique `share_token`, `invitees` JSON) and
`commission_photos` (object key, content type, size). Migrations in
`migrations/`; generate new ones with drizzle-kit.

## Conventions

- `src/lib/sharing.ts` owns tokens, invitee parsing, timezone math,
  Google Calendar links, ICS and the progress timeline — unit-tested.
- Atoms are the only state; hooks only touch React/DOM.
- Errors are Effects; toasts are the single error surface.
