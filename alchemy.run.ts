import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";

// D1 databases consumed by the accounts/hikari/reiya wrangler configs —
// migrated from infra/*.tf. Custom domains and DNS records are owned by each
// app's wrangler.jsonc routes (custom_domain: true creates and manages the
// records); app deploys stay in wrangler too.
export default Alchemy.Stack(
  "websites",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const databases = {
      accounts: yield* Cloudflare.D1.Database("accounts", {
        name: "accounts",
        primaryLocationHint: "weur",
      }),
      hikari: yield* Cloudflare.D1.Database("hikari", {
        name: "hikari",
        primaryLocationHint: "weur",
      }),
      reiya: yield* Cloudflare.D1.Database("reiya", {
        name: "reiya",
        primaryLocationHint: "weur",
      }),
    };

    return {
      databaseIds: {
        accounts: databases.accounts.databaseId,
        hikari: databases.hikari.databaseId,
        reiya: databases.reiya.databaseId,
      },
    };
  }),
);
