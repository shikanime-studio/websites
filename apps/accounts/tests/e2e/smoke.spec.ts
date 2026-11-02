import { expect, test } from "@playwright/test";

test("home introduces the account", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "One account",
  );
  await expect(
    page.getByRole("link", { name: "Sign in" }).first(),
  ).toBeVisible();
});

test("unknown routes render the not-found page", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-page");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page doesn't exist" }),
  ).toBeVisible();
});

test("the account center asks anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/settings");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("the discovery document advertises the auth base path", async ({
  request,
}) => {
  const response = await request.get(
    "/api/auth/.well-known/openid-configuration",
  );
  const body = await response.json();

  expect(response.ok()).toBe(true);
  expect(body.issuer).toMatch(/\/api\/auth$/);
  expect(body.authorization_endpoint).toContain("/oauth2/authorize");
});
