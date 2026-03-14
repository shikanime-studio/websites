import { expect, it } from 'vitest'
import { page } from 'vitest/browser'

it('runs in browser mode (chromium)', async () => {
  document.body.innerHTML = '<button type="button">Hello</button>'

  await expect.element(page.getByRole('button', { name: 'Hello' })).toBeInTheDocument()
})
