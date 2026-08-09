# accounts Central IdP — Manual Deployment Steps

This runbook covers the steps that cannot be performed by the agent because
they require live Cloudflare access and secret values. Each step is manual and
must be run by a human with the appropriate credentials.

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

- run `wrangler deploy` / `wrangler versions upload` for accounts (it writes
  the real id into `wrangler.jsonc` automatically), or
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
  `https://reiya.shikanime.studio/api/auth/oauth2/callback/accounts` with a
  code that exchanges successfully (no `invalid_client` / `invalid_secret`).
