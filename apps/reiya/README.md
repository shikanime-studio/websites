# Reiya

The studio's merch and community site: a gallery of makers, events and
merch drops, with a following feed for signed-in visitors.

**Live:** https://reiya.shikanime.studio

## What it does

- **Explore**: merch findings and featured artists & circles, with
  character/artist/event card grids and inline skeletons.
- **Following**: the same content filtered to what the signed-in visitor
  follows.
- **Search**: the header field carries the query into `/explore?q=`,
  which filters merch, artists, characters, events and showcases by
  title and maker name.
- **Identity**: signs in only through the Accounts Center. Reiya keeps
  no password and no social login of its own; Google, passkeys and
  every other factor live in the Accounts Center.
- **Cards** render through `unpic`.

## Stack

| Layer   | Choice                                                                          |
| ------- | ------------------------------------------------------------------------------- |
| UI      | React 19 + TanStack Router/Start (SSR) + Astryx design system (`neutral` theme) |
| State   | Effect atoms; gallery reads suspend on atoms with explicit inline skeletons     |
| Data    | D1 (Drizzle ORM) — makers, characters, items, events; seedable                  |
| Auth    | better-auth: Accounts Center only (generic OAuth, account linking by email)     |
| Runtime | Cloudflare Workers via `@cloudflare/vite-plugin`                                |

## Routes

| Route              | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `/`                | landing                                          |
| `/explore`         | merch findings + featured artists & circles tabs |
| `/following`       | personalised feed (requires sign-in)             |
| `/privacy-notices` | privacy page                                     |
| `/user/*`          | account screens                                  |
| `/api/*`           | data + auth endpoints                            |

## Develop

```sh
pnpm install            # repo root
pnpm dev -- --port 3103 # matches the dev origin baked into config.ts
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
`http://localhost:<port>/api/auth/callback/accounts` redirect for client
`reiya`, and `ACCOUNTS_CLIENT_SECRET` in `.dev.vars`. Register it with:

```sh
cd apps/accounts
node scripts/register-client.mjs --id reiya --name Reiya \
  --redirect http://localhost:3103/api/auth/callback/accounts \
  --redirect http://127.0.0.1:3103/api/auth/callback/accounts \
  --out /tmp/reiya-client.json --local
```

## Environment

| Name                     | Where                | Purpose                       |
| ------------------------ | -------------------- | ----------------------------- |
| `BETTER_AUTH_SECRET`     | secret / `.dev.vars` | session signing               |
| `ACCOUNTS_CLIENT_SECRET` | secret / `.dev.vars` | Accounts Center OAuth client  |
| `VITE_SITE`              | build env            | canonical origin              |
| `VITE_ACCOUNTS_SITE`     | build env            | accounts origin for discovery |

## Data model (D1)

`makers`, `characters`, `items`, `events`, `licenses` with the
relations that back the explore queries; better-auth tables for
identity. Read helpers live in `src/lib/items.ts` (server functions).

## Design

The shell is the studio shell: a 64px sticky header with a hairline
border, the warm `#faf6f0` canvas, ink text and the shared orange accent
(`#cc4c0c` light / `#ff9a5c` dark) that Accounts and Hikari use. The
palette is declared once in `src/assets/global.css` by re-pointing Astryx
neutral tokens, so components keep using `bg-body`, `text-secondary` and
`bg-accent` without per-page overrides.

## Conventions

- Tabs are a render prop (`TabList` passes the active value down) — no
  context.
- Atoms own data reads; components suspend or render skeletons
  explicitly.
- Card failures toast once per result through `useCardResult`.
