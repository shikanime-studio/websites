# Reiya

The studio's merch and community site: a gallery of makers, events and
merch drops, with a following feed for signed-in visitors.

**Live:** https://reiya.shikanime.studio

## What it does

- **Explore**: merch findings and featured artists & circles, with
  character/artist/event card grids and inline skeletons.
- **Following**: the same content filtered to what the signed-in visitor
  follows.
- **Identity**: signs in through the Accounts Center (generic OAuth,
  account linking by verified email) with Google and passkey support.
- **Cards** render through `unpic` with simple-icons brand marks.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19 + TanStack Router/Start (SSR) + Astryx design system (`neutral` theme) |
| State | Effect atoms; gallery reads suspend on atoms with explicit inline skeletons |
| Data | D1 (Drizzle ORM) — makers, characters, items, events; seedable |
| Auth | better-auth: Accounts Center generic OAuth, Google social, passkey plugin |
| Runtime | Cloudflare Workers via `@cloudflare/vite-plugin` |

## Routes

| Route | Purpose |
|---|---|
| `/` | landing |
| `/explore` | merch findings + featured artists & circles tabs |
| `/following` | personalised feed (requires sign-in) |
| `/privacy-notices` | privacy page |
| `/user/*` | account screens |
| `/api/*` | data + auth endpoints |

## Develop

```sh
pnpm install            # repo root
pnpm dev -- --port 3103 # accounts dev must be on 3101
pnpm check              # tsc --noEmit
pnpm lint               # eslint
pnpm test               # unit (Vitest)
pnpm test:e2e           # Playwright smoke
pnpm build              # production build
```

Local data:

```sh
printf 'y\n' | pnpm exec wrangler d1 migrations apply reiya --local
pnpm db:seed            # generates + applies a seed file, then cleans up
```

Sign-in needs the accounts dev server on 3101
(`VITE_ACCOUNTS_SITE=http://localhost:3101`), a registered
`http://localhost:3103/api/auth/callback/accounts` redirect for client
`reiya`, and `ACCOUNTS_CLIENT_SECRET` in `.dev.vars`.

## Environment

| Name | Where | Purpose |
|---|---|---|
| `BETTER_AUTH_SECRET` | secret / `.dev.vars` | session signing |
| `GOOGLE_CLIENT_SECRET` | secret / `.dev.vars` | Google fallback provider |
| `ACCOUNTS_CLIENT_SECRET` | secret / `.dev.vars` | Accounts Center OAuth client |
| `VITE_SITE` | build env | canonical origin |
| `VITE_ACCOUNTS_SITE` | build env | accounts origin for discovery |

## Data model (D1)

`makers`, `characters`, `items`, `events`, `licenses` with the
relations that back the explore queries; better-auth tables for
identity. Read helpers live in `src/lib/items.ts` (server functions).

## Conventions

- Tabs are a render prop (`TabList` passes the active value down) — no
  context.
- Atoms own data reads; components suspend or render skeletons
  explicitly.
- Card failures toast once per result through `useCardResult`.
