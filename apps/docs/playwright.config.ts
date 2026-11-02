import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const { CI } = process.env;
const port = 3104;
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
    command: "pnpm exec docusaurus start --port=3104 --no-open",
    url: baseURL,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
