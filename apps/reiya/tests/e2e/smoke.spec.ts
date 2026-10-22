import { expect, test } from "@playwright/test";

test("the gallery shell renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Reiya/);
  await expect(page.locator("body")).not.toBeEmpty();
});

test("unknown routes show the not-found view", async ({ page }) => {
  await page.goto("/definitely-not-a-page");

  await expect(page.getByText(/not found/i).first()).toBeVisible();
});
