<!-- owner: Automata | zone: technical | purpose: Canonical technical index for the websites pnpm and Cloudflare Workers monorepo -->
# websites

`shikanime-studio/websites` is a pnpm workspace monorepo of TypeScript web
properties, each deployed as a Cloudflare Worker via Wrangler. It requires
Node ≥ 22 and pnpm ≥ 10, with the exact pnpm version pinned by
`packageManager`. User-facing documentation lives at
[docs.shikanime.studio](https://docs.shikanime.studio) (the `apps/docs` app)
and is canonical for users; this `docs/` is canonical for technical detail.

## Canonical sources

- [Repository README](https://github.com/shikanime-studio/websites#readme)
- [Technical wiki](https://github.com/shikanime-studio/websites/wiki)

## Layout

- `pnpm-workspace.yaml` — workspace members (`packages/*` and the seven
  apps) plus pnpm catalogs grouped by concern (build, runtime, lint, test,
  format, infra, script, types) consumed via the `catalog:` protocol.
- `apps/` — one deployable app per folder, each with `wrangler.jsonc`.
- `packages/` — shared libraries.
- `alchemy.run.ts` — the alchemy.run (`@alchemy.run/cloudflare`) stack
  declaring the Cloudflare D1 databases; replaces the old `infra/` OpenTofu
  tree.
- `flake.nix` — Nix dev shell, treefmt formatting and CI checks.

## Apps

All apps set `compatibility_flags: ["nodejs_compat"]`, and each app's
`wrangler.jsonc` `custom_domain` routes own Worker routing and the DNS
records. Six apps pin `compatibility_date: 2026-09-07`; `accounts` pins
`2025-12-25`. Astro apps add `smart` placement and an `ASSETS` binding.

| App | Site / route | Framework / entry |
| --- | --- | --- |
| `www` | `shikanime.studio`, `www.` | Astro SSR (`@astrojs/cloudflare/entrypoints/server`) |
| `links` | `links.shikanime.studio` | Astro SSR |
| `fade` | `fade.shikanime.studio` | TanStack Start — WebGPU image viewer |
| `reiya` | `reiya.shikanime.studio` | TanStack Start — merch/community site |
| `hikari` | `hikari.shikanime.studio` | TanStack Start — cosplay commission planner |
| `accounts` | `accounts.shikanime.studio` | TanStack Start — studio sign-in, D1 binding `DB` (database `accounts`) |
| `docs` | `docs.shikanime.studio` | Docusaurus, static assets in `./build`, `not_found_handling: single-page-application` |

## Shared packages

- `design` — shared tokens, header, footer and page shell for `accounts`,
  `hikari`, `reiya` and `fade`; `links` and `www` are deliberately out of scope.
- `flags` — OpenFeature feature flags on Cloudflare Flagship, consumed as
  TypeScript source with no build step.

## Infrastructure

`alchemy.run.ts` declares one `Alchemy.Stack("websites")` holding three
Cloudflare D1 databases — `accounts`, `hikari`, `reiya`, each with
`primaryLocationHint: "weur"` — and returns their database ids. Worker
routing and deploys stay in each app's `wrangler.jsonc`.

## Build and deploy

Use the Nix dev shell (`direnv allow` or `nix develop`), then `pnpm install`
and `pnpm build` (or `pnpm -C apps/docs build` for one app). CI runs `nix fmt`
under treefmt with Markdown wrapped at 80 columns, `pnpm build` (Docusaurus
uses `onBrokenLinks: throw`) and `nix flake check` on a runner matrix — but
no workflow in `.github/workflows` deploys apps. All apps except `docs`
deploy automatically through Cloudflare Workers Builds with per-app path
filters; `docs` is manual — build from an `origin/main` worktree and run
`pnpm wrangler deploy` in `apps/docs`.

A green build proves nothing: `docs` serves SPA fallback with HTTP 200 on
unknown paths, so verify a deploy by fetching content unique to the new
revision, not by status code. Every Worker enables logs, invocation logs and
traces in `wrangler.jsonc`.

## Process

Plain-text capitalized commit titles with no conventional prefix; body labels
`Design:`, `Related:`, `Closes #`. One logical change per PR, stacked with
`gh-stack` and landed only through `gh stack merge`. `main` requires one
approval, signed commits and linear history. Never delete `pnpm-lock.yaml`.

## Documentation rule

In-repo `docs/` is canonical for technical detail. The wiki is a rendered
human index that links here.
