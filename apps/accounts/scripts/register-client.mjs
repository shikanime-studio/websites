#!/usr/bin/env node
// Registers a confidential OAuth client for one of the studio apps.
//
//   node scripts/register-client.mjs \
//     --id hikari --name Hikari \
//     --redirect https://hikari.shikanime.studio/api/auth/oauth2/callback/accounts \
//     --redirect http://localhost:3102/api/auth/oauth2/callback/accounts \
//     --out /secure/path/hikari-client.json --local
//
// The provider stores only a SHA-256 hash of the secret; the plaintext is
// written once to --out so it can be installed as a Worker secret.
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const read = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};
const readAll = (flag) =>
  args.flatMap((value, index) => (value === flag ? [args[index + 1]] : []));

const clientId = read("--id");
const name = read("--name") ?? clientId;
const redirects = readAll("--redirect").filter(Boolean);
const out = read("--out");
const scope = args.includes("--local") ? "--local" : "--remote";

if (!clientId || redirects.length === 0 || !out) {
  console.error(
    "usage: register-client.mjs --id <id> --name <name> --redirect <uri>... --out <file> [--local|--remote]",
  );
  process.exit(1);
}

const secret = randomBytes(32).toString("base64url");
const hashed = createHash("sha256")
  .update(secret)
  .digest("base64url");
const now = Math.floor(Date.now() / 1000);
const json = (value) => `'${JSON.stringify(value)}'`;
const text = (value) => `'${String(value).replaceAll("'", "''")}'`;

const sql = `
INSERT INTO oauth_client (
  id, client_id, client_secret, disabled, skip_consent, subject_type,
  scopes, redirect_uris, post_logout_redirect_uris, created_at, updated_at,
  name, uri, application_type, token_endpoint_auth_method, grant_types,
  response_types, require_pkce
) VALUES (
  ${text(`client-${clientId}`)}, ${text(clientId)}, ${text(hashed)}, 0, 0,
  ${text("public")}, ${json(["openid", "profile", "email", "offline_access"])},
  ${json(redirects)}, ${json([])}, ${now}, ${now}, ${text(name)},
  ${text(`https://${clientId}.shikanime.studio`)}, ${text("web")},
  ${text("client_secret_post")},
  ${json(["authorization_code", "refresh_token"])}, ${json(["code"])}, 0
)
ON CONFLICT(client_id) DO UPDATE SET
  client_secret = excluded.client_secret,
  redirect_uris = excluded.redirect_uris,
  updated_at = excluded.updated_at;
`.trim();

execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "accounts", scope, "--command", sql],
  { stdio: "inherit" },
);

writeFileSync(out, JSON.stringify({ clientId, secret }, null, 2), {
  mode: 0o600,
});
console.log(`registered ${clientId} (${scope}); secret written to ${out}`);
