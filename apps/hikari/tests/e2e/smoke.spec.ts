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
  await expect(page.getByLabel("Calendar guests")).toBeVisible();
});

test("the request form pre-fills the timezone and offers characters and cast", async ({ page }) => {
  await page.goto("/commissions/new");

  const timezone = page.getByLabel("Timezone");
  await expect(timezone).toBeVisible();
  await expect(timezone).not.toHaveValue("");

  await expect(page.getByLabel("Characters")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add someone" })).toBeVisible();
  // A photographer is optional now: the shoot can start self-managed.
  await expect(page.getByLabel(/Photographer/)).not.toHaveAttribute("required");
});
