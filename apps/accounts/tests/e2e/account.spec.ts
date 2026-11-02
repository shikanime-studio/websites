import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const PASSWORD = "playwright-password-123";
const NAME = "Playwright User";

/** Each test gets its own identity so parallel runs never share a session. */
function identity() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { email: `playwright-${id}@example.test`, password: PASSWORD, name: NAME };
}

/**
 * Creates the test identity once, then reuses it on later runs. The calls run
 * from the page so they carry the Origin header and real session cookies.
 */
async function signIn(page: Page): Promise<{ email: string }> {
  const who = identity();
  await page.goto("/login");
  const result = await page.evaluate(
    async ({ email, password, name }) => {
      const post = (path: string, body: unknown) =>
        fetch(path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
      const signUp = await post("/api/auth/sign-up/email", {
        email,
        password,
        name,
      });
      if (signUp.ok) {
        return { status: signUp.status, body: "" };
      }
      const signIn = await post("/api/auth/sign-in/email", { email, password });
      return { status: signIn.status, body: await signIn.text() };
    },
    who,
  );
  expect(result.status, result.body).toBe(200);
  return { email: who.email };
}

test("a signed-in user lands in the account center", async ({ page }) => {
  const { email } = await signIn(page);
  await page.goto("/settings");

  await expect(
    page.getByRole("heading", { name: "Accounts Center" }),
  ).toBeVisible();
  await expect(page.getByText(email).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Profiles and personal details" }),
  ).toBeVisible();
});

test("the display name can be changed and persists", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings/profile");

  const field = page.getByLabel("Display name");
  // Wait for hydration: filling before React takes over leaves the state stale.
  await expect(field).toHaveValue(NAME);
  const next = `Playwright ${Date.now()}`;
  await field.fill(next);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue(next);
});

test("the security page lists the current device", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings/security");

  await expect(
    page.getByRole("heading", { name: "Password and security" }),
  ).toBeVisible();
  await expect(page.getByText("Where you're signed in")).toBeVisible();
  await expect(page.getByText("This device")).toBeVisible();
});

test("signing out protects the account center again", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Accounts Center" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();

  await expect(page).toHaveURL("/");
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login$/);
});
