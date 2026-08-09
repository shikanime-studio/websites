# Accounts

## Purpose

- Accounts is the central OAuth/OIDC identity provider for Shikanime Studio
  (see [README.md](README.md)).
- It owns user identity and issues sessions that the other apps (fade, www,
  links, reiya) consume via the shared `@shikanime-studio/auth-shared` package.
- Primary flows: email/password and Google social sign-in, OIDC/OAuth2 consent
  for first-party clients (reiya), and JWT issuance for cross-app sessions.

## URLs

- Production: `https://accounts.shikanime.studio` (see
  [wrangler.jsonc](wrangler.jsonc))
- Auth handler: `/api/auth/*` (better-auth)
- Pages: sign-in (`/sign-in`), consent (`/consent`)

## Commands

- Dev server: `pnpm dev` (Vite, port 3001)
- Typecheck: `pnpm types` (generates `worker-configuration.d.ts` via
  `wrangler types`)
- Tests: `pnpm test` (Vitest, Cloudflare Workers pool)
- DB migrations: `pnpm db:generate` (drizzle-kit), `pnpm db:migrate` (apply to
  the `accounts` D1 database)
- Deploy: `pnpm deploy` (Cloudflare Workers, via Wrangler)

## Configuration

Required environment variables / secrets (set in `wrangler.jsonc`):

- `BETTER_AUTH_URL` — public base URL of this worker.
- `BETTER_AUTH_SECRET` — better-auth session/JWT signing secret.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google social provider.
- `REIYA_CLIENT_SECRET` — shared secret for the `reiya` OAuth client
  (`trustedClients`). Must match the `REIYA_CLIENT_SECRET` set on the reiya
  worker.

## Technical notes

- Stack: TanStack Start (React Router) on Cloudflare Workers, D1 (SQLite) via
  Drizzle.
- Auth: better-auth with the `oneTap()`, `jwt()`, and `oauthProvider()`
  plugins, in that order.
- `oauthProvider` registers `reiya` as a concrete trusted client
  (`trustedClients`) and `fade`/`www`/`links` as `cachedTrustedClients`
  (they read the cross-subdomain session cookie rather than exchanging an
  auth code in this phase).
- Sessions use cross-subdomain cookies scoped to `.shikanime.studio`, so every
  app on a `*.shikanime.studio` subdomain receives the session cookie and can
  resolve the user through the accounts IdP.
- Never commit secrets; set them with `wrangler secret put` (see
  `.hermes/accounts-idp-manual-steps.md`).
