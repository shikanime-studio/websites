# accounts Central IdP — Manual Deployment Steps

This runbook covers the steps that cannot be performed by the agent because they
require live Cloudflare access and secret values. Each step is manual and must
be run by a human with the appropriate credentials.

The corresponding implementation commits live on the `accounts-idp` branch.

## Task 9 — Infrastructure (OpenTofu)

Apply the D1 database for accounts:

```sh
cd infra
tofu init      # if not already initialized
tofu plan
tofu apply     # creates the "accounts" D1 database
```

DNS for `accounts.shikanime.studio` is NOT managed here: the accounts Worker
declares `routes` with `custom_domain: true`, so Cloudflare provisions the
custom-domain record automatically on first deploy.

## Task 9 — Worker id + database_id (wrangler)

The accounts `wrangler.jsonc` ships with a `"PLACEHOLDER"` `database_id`. After
`tofu apply` returns the real D1 id, either:

- run `wrangler deploy` / `wrangler versions upload` for accounts (it writes the
  real id into `wrangler.jsonc` automatically), or
- manually replace `PLACEHOLDER` with the id from `tofu output accounts`.

## Task 12 — reiya Worker secret rotation (manual wrangler)

accounts registers reiya as a trusted OAuth client with
`clientSecret: env.REIYA_CLIENT_SECRET`. The SAME secret string must be set on
both workers (accounts already references `REIYA_CLIENT_SECRET` in its
`trustedClients`; reiya references it in its `genericOAuth` client config).

Generate one shared secret value, then set it on both workers:

```sh
# one value, set on BOTH workers (they must match)
wrangler secret put REIYA_CLIENT_SECRET \
  --config apps/accounts/wrangler.jsonc
wrangler secret put REIYA_CLIENT_SECRET \
  --config apps/reiya/wrangler.jsonc
```

Also confirm the other accounts secrets are set (they were referenced in
`apps/accounts/wrangler.jsonc` vars as test placeholders and must be real in
production):

```sh
wrangler secret put BETTER_AUTH_SECRET      --config apps/accounts/wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_ID        --config apps/accounts/wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_SECRET     --config apps/accounts/wrangler.jsonc
```

## Verification after secrets are set

- `pnpm -F @shikanime-studio/accounts deploy` (or `wrangler deploy`) succeeds.
- Visiting reiya's sign-in button redirects to
  `https://accounts.shikanime.studio/api/auth/oauth2/authorize?...`.
- Completing the accounts flow returns to
  `https://reiya.shikanime.studio/api/auth/oauth2/callback/accounts` with a code
  that exchanges successfully (no `invalid_client` / `invalid_secret`).

## Task 21 — CI coverage (no code change required)

accounts is automatically covered by the existing integration pipeline:

- `.github/workflows/integration.yaml` → `javascript.yaml` runs the
  `shikanime-studio/actions/pnpm/integration@v9` composite action, which
  executes the per-app `types` / `test` / `build` pnpm scripts across the
  workspace.
- accounts is already a registered workspace member (`pnpm-workspace.yaml`,
  added in the scaffold commit) and ships the standard scripts the action
  invokes: `types` (`wrangler types`), `test` (`vitest run`), `build`
  (`vite build`).
- No per-app CI enumeration (matrix/list) exists, so there is nothing to edit to
  opt accounts in — workspace discovery handles it.

Verified locally that all three gates pass for accounts:

```text
pnpm -F @shikanime-studio/accounts types   # exit 0
pnpm -F @shikanime-studio/accounts test    # 3 passed
pnpm -F @shikanime-studio/accounts build   # exit 0
```

The only CI-relevant manual prerequisite is Task 9 (the D1 database must exist
for `test`/`build` to resolve the `env.DB` binding) and Task 12 (secrets must be
set for a real deploy). Neither requires a CI config change.
