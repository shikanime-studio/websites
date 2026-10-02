import type { DrizzleD1Database } from "drizzle-orm/d1";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt, oneTap } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "../schema";

export function createAuth(db: DrizzleD1Database<typeof schema>) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        rateLimit: schema.rateLimits,
        // usePlural pluralizes the jwt plugin's "jwks" model to "jwkss";
        // bind it to the singular-named drizzle table.
        jwkss: schema.jwks,
      },
      usePlural: true,
    }),
    plugins: [
      oneTap(),
      // Signs this server's own tokens; the provider derives its issuer from
      // this plugin's jwt.issuer option (falls back to baseURL).
      jwt({
        jwt: {
          // Issuer pathname must match the auth base path so the provider's
          // well-known metadata hooks resolve under /api/auth.
          issuer: `${import.meta.env.VITE_SITE}/api/auth`,
        },
      }),
      // Upstream type variance (plugin 1.7.3): the plugin endpoint OpenAPI
      // metadata carries `schema.items?: undefined` which does not satisfy
      // better-auth's EndpointOptions union. Runtime contract is correct;
      // remove the directive once upstream aligns the types.
      // @ts-expect-error oauth-provider 1.7.3 endpoint metadata variance
      oauthProvider({
        loginPage: "/login",
        consentPage: "/consent",
        scopes: ["openid", "profile", "email", "offline_access"],
        grantTypes: ["authorization_code", "refresh_token"],
        allowDynamicClientRegistration: false,
        codeExpiresIn: 600,
        accessTokenExpiresIn: 3600,
        refreshTokenExpiresIn: 2_592_000,
      }),
    ],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: import.meta.env.VITE_SITE,
    socialProviders: {
      google: {
        clientId: import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID,
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
