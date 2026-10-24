import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const { CI } = process.env;
const port = 3101;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm db:migrate:local && pnpm dev --port 3101 --strictPort",
    url: baseURL,
    reuseExistingServer: !CI,
    env: {
      VITE_SITE: baseURL,
    },
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
