import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

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
    schema: "./src/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
      url: path.join(wranglerDir, sqliteFile),
    },
  } satisfies Config;
}
function createRemoteConfig() {
  return {
    schema: "./src/schema.ts",
    out: "./migrations",
    dialect: "sqlite",
    driver: "d1-http",
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
      token: process.env.CLOUDFLARE_API_TOKEN!,
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
