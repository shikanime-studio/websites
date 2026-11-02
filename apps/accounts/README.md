# Accounts

The Shikanime Studio identity provider: one sign-in for every studio
application. better-auth serves OpenID Connect from Cloudflare Workers
with D1 as the store, so an app never talks to Google directly.

**Live:** https://accounts.shikanime.studio

## What it does

- **Sign-in** with Google (One Tap on the login page) or the dev-only
  email/password provider for Playwright.
- **Accounts Center** (`/settings`): profiles and personal details,
  password and security (active sessions, linked providers, authorized
  OAuth clients), and a "More from Shikanime Studio" grid.
- **OAuth 2.1 / OIDC provider** (`@better-auth/oauth-provider`): hikari
  and reiya are confidential clients (`client_secret_post`, no PKCE
  requirement). Discovery at
  `/api/auth/.well-known/openid-configuration`.
- **Consent screen** (`/consent`): verifies the signed
  `oauth_query` parameter, records the grant, and forwards the
  continuation URL that better-auth returns.
- **Client registration**: `scripts/register-client.mjs` inserts a
  client row (secret stored as SHA-256, `enable_end_session` on,
  post-logout origins recorded) and writes the plaintext secret to a
  file outside the repository.

## Stack

| Layer   | Choice                                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------- |
| UI      | React 19 + TanStack Router/Start (SSR) + Astryx design system (`neutral` theme, studio-orange accent) |
| State   | Effect atoms (`@effect/atom-react`) — session, sessions list, linked providers, authorized clients    |
| Auth    | better-auth with Google social + OAuth provider plugin                                                |
| Data    | D1 (Drizzle ORM), migration `0000_huge_jean_grey`                                                     |
| Runtime | Cloudflare Workers via `@cloudflare/vite-plugin`                                                      |

## Routes

| Route                | Purpose                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `/`                  | signed-out landing (hero + account preview); signed-in redirects to `/settings` |
| `/login`             | One Tap sign-in                                                                 |
| `/settings`          | Accounts Center hub (profiles, personal details, security summary)              |
| `/settings/profile`  | display name editor                                                             |
| `/settings/security` | sessions, linked providers, authorized clients + revoke                         |
| `/consent`           | OAuth consent (requires `oauth_query`)                                          |
| `/api/auth/*`        | better-auth endpoints                                                           |
| `*`                  | branded 404                                                                     |

## Develop

```sh
pnpm install                 # from the repo root
pnpm dev -- --port 3101     # hikari and reiya expect 3101 in dev
pnpm db:migrate:local        # apply D1 migrations to local state
pnpm check                   # tsc --noEmit
pnpm lint                    # eslint
pnpm test                    # unit + component (Vitest)
pnpm test:e2e                # Playwright (starts its own dev server)
pnpm build                   # production build
```

`pretest:e2e` runs `scripts/ensure-dev-vars.mjs`, which writes
`.dev.vars` with a random `BETTER_AUTH_SECRET` when missing — the file
is git-ignored.

Port 3101 matters: hikari and reiya default their `VITE_ACCOUNTS_SITE`
to it in dev.

## Secrets

| Name                   | Where                                                  | Purpose                      |
| ---------------------- | ------------------------------------------------------ | ---------------------------- |
| `BETTER_AUTH_SECRET`   | Worker secret / `.dev.vars`                            | session signing              |
| `GOOGLE_CLIENT_SECRET` | Worker secret / `.dev.vars`                            | Google social provider       |
| OAuth client secrets   | files under `~/.config/shikanime/` (never in the repo) | per-app confidential clients |

Register or rotate a client:

```sh
node scripts/register-client.mjs --id hikari --name Hikari \
  --redirect https://hikari.shikanime.studio/api/auth/callback/accounts \
  --redirect http://localhost:3102/api/auth/callback/accounts \
  --out ~/.config/shikanime/hikari-accounts-client.json --remote
```

`--redirect` replaces the whole URI set: pass every origin the app serves.

The studio apps and the OAuth clients they own:

| App    | Client id | Callback                      | Notes                                   |
| ------ | --------- | ----------------------------- | --------------------------------------- |
| Hikari | `hikari`  | `/api/auth/callback/accounts` | better-auth generic OAuth               |
| Reiya  | `reiya`   | `/api/auth/callback/accounts` | Accounts only — no Google, no passwords |
| Fade   | `fade`    | `/api/studio/callback`        | Confidential client, PKCE, no database  |

Fade has no D1 database: its callback exchanges the code, reads
`oauth2/userinfo`, and keeps a signed cookie. The Worker secrets are
`ACCOUNTS_CLIENT_SECRET` and `STUDIO_SESSION_SECRET`.

## Data model (D1)

better-auth tables (`user`, `session`, `account`, `verification`) plus
OAuth provider tables (`oauth_client`, `oauth_consent`,
`oauth_access_token`, `oauth_refresh_token`, …). Schema in `src/schema.ts`,
generated by drizzle-kit.

## Deployment

Workers Builds deploys `main` automatically. Manual: `pnpm deploy`.
Migrations must be applied to remote D1 before a deploy that needs them:
`printf 'y\n' | pnpm db:migrate` with `CLOUDFLARE_ACCOUNT_ID` set.

## Design system

The shell comes from `@shikanime-studio/design`: `StudioHeader` (the 64px
band), `StudioFooter` and `PageShell`, plus the `@shikanime-studio/design/
styles.css` foundation this app imports first. Only the brand hue is local —
`--studio-accent` and friends — so a layout change lands in one package and
reaches every product app.

## Conventions

- Copy lives inline (no i18n catalogue); en-GB tone, short sentences.
- Effects are the only error path for async actions; UI state is atoms.
- The sidebar is the navigation inside the center — no marketing chrome.
