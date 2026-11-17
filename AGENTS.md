# Websites

Shikanime Studio web properties (public sites + apps), managed as a pnpm
workspace monorepo.

**Language:** TypeScript

## Structure

- `apps/*` — One deployable app per folder:
  - `www` — Public-facing studio site (`https://shikanime.studio`)
  - `links` — Link hub / landing page (`https://links.shikanime.studio`)
  - `fade` — Local image viewer using WebGPU (`https://fade.shikanime.studio`)
  - `reiya` — Merch/community site (`https://reiya.shikanime.studio`)
  - `hikari` — Cosplay photoshoot commission planner
    (`https://hikari.shikanime.studio`)
- Each app has its own `wrangler.jsonc` and deploys to Cloudflare via Wrangler

## Commit Style

- Plain-text capitalized title, no conventional-commit prefix
- Body with labels: `Design:`, `Related:`, `Closes #`
- Keep Markdown lines wrapped at 80 columns and run `nix fmt` before shipping
- Bot PRs: the reviewer takes the lead — the bot author never acts on
  review comments, so apply the verdict at review time (merge clean PRs,
  fix or close broken ones) instead of commenting and waiting.

## Protect `main`

- Require 1 approving review
- Require linear history (no merge commits)
- Require signed commits
- Squash+rebase merge only

_Never delete `pnpm-lock.yaml` — use `--no-frozen-lockfile` if needed_


## Environment

This repository ships a `.envrc` for direnv. Run `direnv allow` once after
cloning; direnv then loads the Nix flake dev shell automatically on every
directory change (`.envrc` runs
`use flake . --accept-flake-config --no-pure-eval`). Without direnv, enter
the same shell manually with `nix develop`.
