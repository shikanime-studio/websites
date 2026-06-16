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

- 1 commit == 1 PR via ghstack (1 commit is 1 logical atomic change)
- Split work into stacked PRs to keep each PR small and reviewable
- To update a PR: edit files, then `jj squash` (or `git commit --amend`) into the
  **target commit** of the stack — the one that PR represents
- Resubmit with `ghstack` after squashing
- `ghstack land` on the head PR to land the entire stack
- Never `gh pr merge` (creates poisoned commits)
- Never force-push ghstack branches

## Protect `main`

- Require 1 approving review
- Require linear history (no merge commits)
- Require signed commits
- Squash+rebase merge only

*Never delete `pnpm-lock.yaml` — use `--no-frozen-lockfile` if needed*