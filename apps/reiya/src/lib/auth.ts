import type { DrizzleD1Database } from "drizzle-orm/d1";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, oneTap } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "../schema";

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
    plugins: [
      oneTap(),
      genericOAuth({
        config: [
          {
            providerId: "accounts",
            clientId: "reiya",
            clientSecret: env.REIYA_CLIENT_SECRET,
            scopes: ["openid", "profile", "email", "offline_access"],
            redirectURI:
              "https://reiya.shikanime.studio/api/auth/oauth2/callback/accounts",
            authorizationUrl:
              "https://accounts.shikanime.studio/api/auth/oauth2/authorize",
            tokenUrl: "https://accounts.shikanime.studio/api/auth/oauth2/token",
            userInfoUrl:
              "https://accounts.shikanime.studio/api/auth/oauth2/userinfo",
            issuer: "https://accounts.shikanime.studio/api/auth",
          },
        ],
      }),
    ],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: import.meta.env.SITE,
    socialProviders: {
      google: {
        clientId: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID,
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

export type Auth = ReturnType<typeof createAuth>;
