import { expect, test } from "@playwright/test";

test("the photo editor boots", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Fade/);
});
