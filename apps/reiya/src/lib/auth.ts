import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oneTap } from "better-auth/plugins";
import * as schema from "../schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const createAuth = (
  db: DrizzleD1Database<typeof schema>,
  locals: App.Locals,
) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        rateLimit: schema.rateLimits,
      },
      usePlural: true,
    }),
    plugins: [oneTap()],
    secret: locals.runtime.env.BETTER_AUTH_SECRET,
    baseURL: import.meta.env.SITE,
    socialProviders: {
      ...(import.meta.env.PUBLIC_GOOGLE_CLIENT_ID &&
      locals.runtime.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID,
              clientSecret: locals.runtime.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
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

export type Auth = ReturnType<typeof createAuth>;
