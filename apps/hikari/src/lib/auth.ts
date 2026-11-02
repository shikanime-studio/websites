import type { DrizzleD1Database } from "drizzle-orm/d1";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "../schema";
import { ACCOUNTS_SITE, GOOGLE_CLIENT_ID, SITE } from "./config";

export function createAuth(db: DrizzleD1Database<typeof schema>) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        rateLimit: schema.rateLimits,
      },
      usePlural: true,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: SITE,
    // Signing in through the Accounts Center reuses the existing row when the
    // email matches, so commissions keep pointing at the same person.
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["accounts"],
      },
    },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: "accounts",
            discoveryUrl: `${ACCOUNTS_SITE}/api/auth/.well-known/openid-configuration`,
            clientId: "hikari",
            clientSecret: env.ACCOUNTS_CLIENT_SECRET,
            scopes: ["openid", "profile", "email"],
            pkce: true,
            // The Accounts Center session is the studio identity: signing out of
            // one app must not end it everywhere.
            disableProviderLogout: true,
          },
        ],
      }),
    ],
    socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    rateLimit: {
      window: 60,
      max: 100,
      storage: "database",
    },
  });
}

