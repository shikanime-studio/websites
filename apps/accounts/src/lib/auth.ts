import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Schema } from "../schema";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt, oneTap } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "../schema";

export function createAuth(db: DrizzleD1Database<Schema>) {
  return betterAuth({
    appName: "Shikanime Studio Accounts",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        rateLimit: schema.rateLimits,
      },
      usePlural: true,
    }),
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: ".shikanime.studio",
      },
    },
    trustedOrigins: [
      "https://accounts.shikanime.studio",
      "https://reiya.shikanime.studio",
      "https://fade.shikanime.studio",
      "https://links.shikanime.studio",
      "https://shikanime.studio",
    ],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      oneTap(),
      jwt(),
      oauthProvider({
        loginPage: "/sign-in",
        consentPage: "/consent",
        scopes: ["openid", "profile", "email", "offline_access"],
        validAudiences: ["https://accounts.shikanime.studio"],
        allowDynamicClientRegistration: false,
        cachedTrustedClients: new Set(["reiya", "fade", "www", "links"]),
        trustedClients: [
          {
            clientId: "reiya",
            clientSecret: env.REIYA_CLIENT_SECRET,
            name: "Reiya",
            type: "web",
            redirectUris: [
              "https://reiya.shikanime.studio/api/auth/oauth2/callback/accounts",
            ],
            disabled: false,
            skipConsent: true,
            metadata: {},
          },
        ],
      }),
    ],
  });
}
