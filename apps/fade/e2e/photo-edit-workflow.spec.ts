import type { Locator } from "@playwright/test";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setRangeValue(locator: Locator, value: number) {
  await locator.evaluate((el: HTMLInputElement, nextValue: number) => {
    const input = el;
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    if (valueSetter) {
      valueSetter.call(input, String(nextValue));
    } else {
      input.value = String(nextValue);
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test("imports an image and adjusts lighting controls", async ({
  page,
}, testInfo) => {
  testInfo.setTimeout(60000);

  const fixtureDir = path.resolve(__dirname, "fixtures");
  const fixtureNames = (await readdir(fixtureDir)).filter((name) =>
    name.toLowerCase().endsWith(".jpg"),
  );
  const fixtures = await Promise.all(
    fixtureNames.map(async (name) => {
      const size = (await stat(path.join(fixtureDir, name))).size;
      return { name, size };
    }),
  );
  fixtures.sort((a, b) => a.size - b.size);

  const [fixtureA, fixtureB] = fixtures.slice(0, 2);
  if (!fixtureA || !fixtureB) {
    throw new Error("e2e/fixtures must contain at least two .JPG files");
  }

  await page.route("**/__e2e/fixtures/*", async (route) => {
    const url = new URL(route.request().url());
    const fixtureName = decodeURIComponent(url.pathname.split("/").pop() ?? "");
    const filePath = path.join(fixtureDir, fixtureName);

    try {
      const body = await readFile(filePath);
      await route.fulfill({
        status: 200,
        body,
        contentType: "image/jpeg",
      });
    } catch {
      await route.fulfill({
        status: 404,
        body: "Not found",
        contentType: "text/plain",
      });
    }
  });

  await page.addInitScript(
    ({ files }) => {
      function createMockDirectoryHandle(
        nextFiles: Array<{ name: string; type: string }>,
      ) {
        const fileHandles = nextFiles.map((file) => {
          return {
            kind: "file",
            name: file.name,
            getFile: async () => {
              const response = await fetch(
                `/__e2e/fixtures/${encodeURIComponent(file.name)}`,
              );
              const blob = await response.blob();
              return new File([blob], file.name, { type: file.type });
            },
          };
        });

        return {
          kind: "directory",
          name: "e2e-fixtures",
          async *values() {
            for (const fileHandle of fileHandles) {
              yield fileHandle;
            }
          },
        };
      }

      const anyWindow = window as unknown as {
        showDirectoryPicker?: (options?: unknown) => Promise<unknown>;
        __e2e?: { directoryPickerCalls: number };
      };
      anyWindow.__e2e = { directoryPickerCalls: 0 };
      anyWindow.showDirectoryPicker = async () => {
        if (anyWindow.__e2e) {
          anyWindow.__e2e.directoryPickerCalls += 1;
        }
        return createMockDirectoryHandle(files);
      };
    },
    {
      files: [
        {
          name: fixtureA.name,
          type: "image/jpeg",
        },
        {
          name: fixtureB.name,
          type: "image/jpeg",
        },
      ],
    },
  );

  await page.goto("/");

  await expect(page.getByText("No files loaded")).toBeVisible();

  await page.getByRole("button", { name: "Open Folder" }).click();

  await page.waitForFunction(() => {
    const anyWindow = window as unknown as {
      __e2e?: { directoryPickerCalls: number };
    };
    return (anyWindow.__e2e?.directoryPickerCalls ?? 0) > 0;
  });

  const expandSidebar = page.getByRole("button", { name: "Expand sidebar" });
  if (await expandSidebar.isVisible()) {
    await expandSidebar.click();
  }

  const expandFilmstrip = page.getByRole("button", {
    name: "Expand filmstrip",
  });
  if (await expandFilmstrip.isVisible()) {
    await expandFilmstrip.click();
  }

  await expect(page.getByText("No files loaded")).toBeHidden({
    timeout: 45000,
  });

  const anySelectButton = page.locator('button[aria-label^="Select "]').first();
  await expect(anySelectButton).toBeVisible({ timeout: 45000 });

  const preferredSelectButton = page.locator(
    `button[aria-label="Select ${fixtureA.name}"]`,
  );
  if (await preferredSelectButton.isVisible()) {
    await preferredSelectButton.click();
  } else {
    await anySelectButton.click();
  }

  await expect(page.getByRole("button", { name: /LIGHTING/i })).toBeVisible();

  const exposureSlider = page.getByRole("slider", { name: "Exposure" });
  await expect(exposureSlider).toBeVisible();
  await setRangeValue(exposureSlider, 1.25);
  await expect(exposureSlider).toHaveValue("1.25");

  const temperatureSlider = page.getByRole("slider", { name: "Temperature" });
  await setRangeValue(temperatureSlider, 0.5);
  await expect(temperatureSlider).toHaveValue("0.5");

  const tintSlider = page.getByRole("slider", { name: "Tint" });
  await setRangeValue(tintSlider, -0.3);
  await expect(tintSlider).toHaveValue("-0.3");

  const hueSlider = page.getByRole("slider", { name: "Hue" });
  await setRangeValue(hueSlider, 0.2);
  await expect(hueSlider).toHaveValue("0.2");
});
