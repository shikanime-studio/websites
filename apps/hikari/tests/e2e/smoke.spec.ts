import { expect, test } from "@playwright/test";

test("the landing page explains the commission service", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Hikari/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("How it works")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "One link for the whole shoot." }),
  ).toBeVisible();
});

test("a visitor can open the commission request form", async ({ page }) => {
  const response = await page.goto("/commissions/new");

  expect(response?.status()).toBe(200);
  await expect(page.locator("form")).toBeVisible();
  await expect(page.getByLabel("Timezone")).toBeVisible();
  await expect(
    page.getByLabel("Invite helpers, models and crew"),
  ).toBeVisible();
});
