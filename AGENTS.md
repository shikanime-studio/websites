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
- Each app has its own `wrangler.jsonc` and deploys to Cloudflare via Wrangler

## Commit Style

- Plain-text capitalized title, no conventional-commit prefix
- Body with labels: `Design:`, `Related:`, `Closes #`
- Keep Markdown lines wrapped at 80 columns and run `nix fmt` before shipping

## Protect `main`

- Require 1 approving review
- Require linear history (no merge commits)
- Require signed commits
- Squash+rebase merge only

_Never delete `pnpm-lock.yaml` — use `--no-frozen-lockfile` if needed_

## Stack Workflow

- Install the official GitHub extension once:
  `gh extension install github/gh-stack` (requires GitHub CLI ≥ 2.0; `gh stack`
  is in public preview and may change).
- Keep one logical change per PR; split large work into a stack of PRs.
- Create a stack: `gh stack init`, then `gh stack add` for each new branch, and
  commit on the active branch. `gh stack view` lists the stack.
- Submit/update: `gh stack submit` (add `--open` to open PRs, `--auto` to skip
  prompts). Resubmit after each change to refresh titles, bodies, and branches.
- Pull down an existing stack: `gh stack checkout <PR_NUMBER>` (also accepts a
  stack number, PR URL, or branch name).
- Rebase onto updated trunk: `gh stack rebase` (cascading), then
  `gh stack submit`.
- Land a stack: `gh stack merge` (interactive) or
  `gh stack merge <PR_NUMBER> --yes --squash` to merge up to a PR.
- Never `gh pr merge` on a stacked PR — only `gh stack merge` lands stacks.
- Never force-push stack branches; `gh stack` owns the branch pointers.
