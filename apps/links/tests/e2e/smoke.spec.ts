import { expect, test } from "@playwright/test";

test("the root redirects to the studio site", async ({ request }) => {
  const response = await request.get("/", { maxRedirects: 0 });

  expect(response.status()).toBe(301);
  const headers = await response.headersArray();
  const location = headers.find(
    (header) => header.name.toLowerCase() === "location",
  )?.value;

  expect(location).toBe("https://shikanime.studio");
});

test("a profile page renders its title", async ({ page }) => {
  const response = await page.goto("/shikanime");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Shikanime");
});
