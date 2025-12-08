import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oneTap } from "better-auth/plugins";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";

export const createAuth = (db: DrizzleD1Database<typeof schema>) =>
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
    socialProviders: {
      google: {
        clientId: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID!,
        clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET!,
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

export type Auth = ReturnType<typeof createAuth>;
