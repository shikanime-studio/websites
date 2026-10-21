import type { Config } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "drizzle-kit";

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

export default defineConfig(createLocalConfig());
