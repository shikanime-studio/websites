import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { z } from "zod";

const config = {
  out: "./migrations",
  dialect: "sqlite",
} satisfies Config;

function createLocalConfig() {
  const wranglerDir = path.join(
    process.cwd(),
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
  );
  const sqliteFile = fs
    .readdirSync(wranglerDir)
    .find((file) => file.endsWith(".sqlite"));
  if (!sqliteFile) {
    throw new Error(
      "No SQLite file found in .wrangler/state/v3/d1/miniflare-D1DatabaseObject",
    );
  }
  return {
    ...config,
    schema: "./src/schema.ts",
    dbCredentials: {
      url: path.join(wranglerDir, sqliteFile),
    },
  } satisfies Config;
}

const remoteEnvSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_DATABASE_ID: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
});

function createRemoteConfig() {
  const env = remoteEnvSchema.parse(process.env);
  return {
    ...config,
    schema: "./src/schema.ts",
    driver: "d1-http",
    dbCredentials: {
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: env.CLOUDFLARE_DATABASE_ID,
      token: env.CLOUDFLARE_API_TOKEN,
    },
  } satisfies Config;
}

export default defineConfig(
  process.env.LOCAL !== "true"
    ? createLocalConfig()
    : process.env.REMOTE !== "true"
      ? createRemoteConfig()
      : createLocalConfig(),
);
