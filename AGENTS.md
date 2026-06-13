# websites

Shikanime Studio web properties — pnpm workspace monorepo.

**Language:** TypeScript

**Structure:** `apps/{www,links,fade,reiya}` — each deploys to Cloudflare via Wrangler with own `wrangler.jsonc`

**Commit style:** Plain-text capitalized title, no prefix. Body with labels: `Design:`, `Related:`, `Closes #`.

**Stack:** 1 commit == 1 PR via ghstack. Amend + `ghstack` to resubmit. `ghstack land` on head PR to land stack. Never `gh pr merge`. Never force-push.

**Protect `main`:** 1 review, linear history, signed commits, squash+rebase only.

*Never delete `pnpm-lock.yaml`*
