import { expect, test } from "@playwright/test";

test("the studio home renders", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Shikanime Studio");
  await expect(page.getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "mailto:contact@shikanime.studio",
  );
});
