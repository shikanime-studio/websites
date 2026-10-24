import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";

// Local dev/test only: Wrangler needs a secret before the worker can boot.
if (!existsSync(".dev.vars")) {
  writeFileSync(
    ".dev.vars",
    `BETTER_AUTH_SECRET=${randomBytes(32).toString("base64url")}\n`,
  );
}
