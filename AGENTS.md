# Websites

Shikanime Studio web properties (public sites + apps), managed as a pnpm workspace monorepo.

**Language:** TypeScript

## Structure

- `apps/*` — One deployable app per folder:
  - `www` — Public-facing studio site (`https://shikanime.studio`)
  - `links` — Link hub / landing page (`https://links.shikanime.studio`)
  - `fade` — Local image viewer using WebGPU (`https://fade.shikanime.studio`)
  - `reiya` — Merch/community site (`https://reiya.shikanime.studio`)
- Each app has its own `wrangler.jsonc` and deploys to Cloudflare via Wrangler

## Commit Style

- Plain-text capitalized title, no conventional-commit prefix
- Body with labels: `Design:`, `Related:`, `Closes #`
- Keep Markdown lines wrapped at 80 columns and run `nix fmt` before shipping

## Stack

- 1 commit == 1 PR via ghstack
- Amend + `ghstack` to resubmit
- `ghstack land` on head PR to land the entire stack
- Never `gh pr merge` (creates poisoned commits)
- Never force-push ghstack branches
- ghstack only works on HEAD commit chains, not detached HEADs

## Protect `main`

- Require 1 approving review
- Require linear history (no merge commits)
- Require signed commits
- Squash+rebase merge only

*Never delete `pnpm-lock.yaml` — use `--no-frozen-lockfile` if needed*