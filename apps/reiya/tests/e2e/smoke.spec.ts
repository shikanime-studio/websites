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

test("the header offers one studio sign-in", async ({ page }) => {
  await page.goto("/");

  const header = page.locator("header");
  await expect(header.getByRole("button", { name: /sign in/i })).toHaveCount(1);
  await expect(header.getByRole("searchbox")).toBeVisible();
  // No Google button: the Accounts Center owns every factor.
  await expect(header.getByRole("button", { name: /google/i })).toHaveCount(0);
});

test("search carries the query into explore", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("silk");
  await page.getByRole("searchbox").press("Enter");

  await expect(page).toHaveURL(/\/explore\?q=silk/);
  await expect(page.getByRole("heading", { name: /results for/i })).toBeVisible();
});
