import { expect, test } from "@playwright/test";

test("the docs home renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Shikanime Studio Docs/);
});

test("the platform section is browsable", async ({ page }) => {
  const response = await page.goto("/docs/platform");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
