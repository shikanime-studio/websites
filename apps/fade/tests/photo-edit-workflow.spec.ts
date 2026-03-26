import type { Locator, Page, Request, Route } from '@playwright/test'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setRangeValue(
  page: Page,
  locator: Locator,
  value: number,
) {
  await locator.scrollIntoViewIfNeeded()

  const minAttr = await locator.getAttribute('min')
  const maxAttr = await locator.getAttribute('max')
  const stepAttr = await locator.getAttribute('step')

  const min = minAttr ? Number(minAttr) : 0
  const max = maxAttr ? Number(maxAttr) : 100
  const step = stepAttr ? Number(stepAttr) : 1
  const range = max - min

  const clampedValue = Math.max(min, Math.min(max, value))

  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('Unable to compute slider bounding box')
  }

  const targetRatio = range === 0 ? 0 : (clampedValue - min) / range
  const y = box.y + box.height / 2

  const clickAtX = async (x: number) => {
    await page.mouse.move(box.x + x, y)
    await page.mouse.down()
    await page.mouse.up()
  }

  const tolerance = step > 0 ? step / 2 : Math.max(0.001, range / 1000)
  const clampX = (x: number) => Math.max(1, Math.min(box.width - 1, x))

  const readValue = async () => Number(await locator.inputValue())

  let lowX = 1
  let highX = box.width - 1

  await clickAtX(clampX(lowX))
  let lowValue = await readValue()

  await clickAtX(clampX(highX))
  let highValue = await readValue()

  if (Number.isFinite(lowValue) && Number.isFinite(highValue) && lowValue > highValue) {
    ;[lowX, highX] = [highX, lowX]
    ;[lowValue, highValue] = [highValue, lowValue]
  }

  await clickAtX(clampX(targetRatio * box.width))

  for (let i = 0; i < 12; i += 1) {
    const currentValue = await readValue()
    if (Number.isFinite(currentValue) && Math.abs(currentValue - clampedValue) <= tolerance) {
      break
    }

    const midX = (lowX + highX) / 2
    await clickAtX(clampX(midX))

    const nextValue = await readValue()
    if (!Number.isFinite(nextValue)) {
      break
    }

    if (nextValue < clampedValue) {
      lowX = midX
      lowValue = nextValue
    }
    else {
      highX = midX
      highValue = nextValue
    }

    if (
      Number.isFinite(lowValue)
      && Number.isFinite(highValue)
      && lowValue <= clampedValue
      && clampedValue <= highValue
      && Math.abs(highX - lowX) <= 2
    ) {
      break
    }
  }
}

async function installE2EFixtureRoutes(page: Page, fixtureDir: string) {
  const pattern = '**/__e2e/fixtures/*'
  const handler = async (route: Route, request: Request) => {
    const url = new URL(request.url())
    const fixtureName = decodeURIComponent(url.pathname.split('/').pop() ?? '')
    const filePath = path.join(fixtureDir, fixtureName)

    try {
      const body = await readFile(filePath)
      await route.fulfill({
        status: 200,
        body,
        contentType: 'image/jpeg',
      })
    }
    catch {
      await route.fulfill({
        status: 404,
        body: 'Not found',
        contentType: 'text/plain',
      })
    }
  }

  await page.route(pattern, handler)

  return {
    async [Symbol.asyncDispose]() {
      await page.unroute(pattern, handler)
    },
  }
}

async function expectSelectedImageToRender(page: Page, fileName: string) {
  await expect(page.locator(`button[aria-label="Select ${fileName}"][aria-current="true"]`)).toBeVisible()
  await expect(page.locator(`dd[title="${fileName}"]`)).toBeVisible()

  const dimensionsText = await page
    .locator('dt', { hasText: 'Dimensions' })
    .locator('..')
    .locator('dd')
    .textContent()
    ?? ''

  const match = dimensionsText.match(/(\d+)\s*×\s*(\d+)/)
  if (!match) {
    throw new Error(`Unable to parse Dimensions text: "${dimensionsText}"`)
  }

  const [_, widthText, heightText] = match
  const expectedWidth = Number(widthText)
  const expectedHeight = Number(heightText)

  expect(expectedWidth).toBeGreaterThan(0)
  expect(expectedHeight).toBeGreaterThan(0)

  const hiddenPreviewImage = page.locator(`img.hidden[alt="${fileName}"]`)
  await expect(hiddenPreviewImage).toHaveCount(1)
  await expect(hiddenPreviewImage).toHaveJSProperty('naturalWidth', expectedWidth)
  await expect(hiddenPreviewImage).toHaveJSProperty('naturalHeight', expectedHeight)
}

test('imports an image and adjusts lighting controls', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000)

  const fixtureDir = path.resolve(__dirname, 'fixtures')
  const fixtureNames = (await readdir(fixtureDir)).filter(name => name.toLowerCase().endsWith('.jpg'))
  const fixtures = await Promise.all(
    fixtureNames.map(async (name) => {
      const size = (await stat(path.join(fixtureDir, name))).size
      return { name, size }
    }),
  )
  fixtures.sort((a, b) => a.size - b.size)

  const [fixtureA, fixtureB] = fixtures.slice(0, 2)
  if (!fixtureA || !fixtureB) {
    throw new Error('e2e/fixtures must contain at least two .JPG files')
  }

  await using _fixturesRoute = await installE2EFixtureRoutes(page, fixtureDir)

  const files = [
    { name: fixtureA.name, type: 'image/jpeg' },
    { name: fixtureB.name, type: 'image/jpeg' },
  ] satisfies Array<{ name: string, type: string }>

  await page.addInitScript(({ files }) => {
    function createMockDirectoryHandle(
      nextFiles: Array<{ name: string, type: string }>,
    ) {
      const fileHandles = nextFiles.map((file) => {
        const fileHandle = {
          kind: 'file' as const,
          name: file.name,
          getFile: async () => {
            const response = await fetch(
              `/__e2e/fixtures/${encodeURIComponent(file.name)}`,
            )
            const blob = await response.blob()
            return new File([blob], file.name, { type: file.type })
          },
        } satisfies Pick<FileSystemFileHandle, 'kind' | 'name' | 'getFile'>

        return fileHandle as unknown as FileSystemFileHandle
      })

      const directoryHandle = {
        kind: 'directory' as const,
        name: 'e2e-fixtures',
        async* values() {
          for (const fileHandle of fileHandles) {
            yield fileHandle
          }
        },
      } satisfies Pick<FileSystemDirectoryHandle, 'kind' | 'name' | 'values'>

      return directoryHandle
    }

    window.showDirectoryPicker = async (_options) => {
      return createMockDirectoryHandle(files) as unknown as FileSystemDirectoryHandle
    }
  }, { files })

  await page.goto('/')

  await expect(page.getByText('No files loaded')).toBeVisible()

  await page.getByRole('button', { name: 'Open Folder' }).click()

  const expandSidebar = page.getByRole('button', { name: 'Expand sidebar' })
  if (await expandSidebar.isVisible()) {
    await expandSidebar.click()
  }

  const expandFilmstrip = page.getByRole('button', { name: 'Expand filmstrip' })
  if (await expandFilmstrip.isVisible()) {
    await expandFilmstrip.click()
  }

  await expect(page.getByText('No files loaded')).toBeHidden({ timeout: 45000 })

  const anySelectButton = page.locator('button[aria-label^="Select "]').first()
  await expect(anySelectButton).toBeVisible({ timeout: 45000 })

  const preferredSelectButton = page.locator(
    `button[aria-label="Select ${fixtureA.name}"]`,
  )
  if (await preferredSelectButton.isVisible()) {
    await preferredSelectButton.click()
  }
  else {
    await anySelectButton.click()
  }

  await expectSelectedImageToRender(page, fixtureA.name)
  await expect(page.getByText(/1\s*\/\s*2/)).toBeVisible()

  await page.getByRole('button', { name: `Select ${fixtureB.name}` }).click()
  await expectSelectedImageToRender(page, fixtureB.name)
  await expect(page.getByText(/2\s*\/\s*2/)).toBeVisible()

  await page.getByRole('button', { name: `Select ${fixtureA.name}` }).click()
  await expectSelectedImageToRender(page, fixtureA.name)

  await expect(page.getByRole('button', { name: /LIGHTING/i })).toBeVisible()

  const exposureSlider = page.getByRole('slider', { name: 'Exposure' })
  await expect(exposureSlider).toBeVisible()
  await setRangeValue(page, exposureSlider, 1.25)
  await expect
    .poll(async () => Math.abs(Number(await exposureSlider.inputValue()) - 1.25))
    .toBeLessThanOrEqual(0.15)

  const temperatureSlider = page.getByRole('slider', { name: 'Temperature' })
  await setRangeValue(page, temperatureSlider, 0.5)
  await expect
    .poll(async () => Math.abs(Number(await temperatureSlider.inputValue()) - 0.5))
    .toBeLessThanOrEqual(0.05)

  const tintSlider = page.getByRole('slider', { name: 'Tint' })
  await setRangeValue(page, tintSlider, -0.3)
  await expect
    .poll(async () => Math.abs(Number(await tintSlider.inputValue()) - -0.3))
    .toBeLessThanOrEqual(0.05)

  const hueSlider = page.getByRole('slider', { name: 'Hue' })
  await setRangeValue(page, hueSlider, 0.2)
  await expect
    .poll(async () => Math.abs(Number(await hueSlider.inputValue()) - 0.2))
    .toBeLessThanOrEqual(0.05)
})
