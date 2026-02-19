import type { Command } from '../lib/db'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { keymap as keymapSchema, keymapsCollection } from '../lib/db'
import { useKeydown } from './useKeydown'

export function useKeymap(command: Command, handler: () => void) {
  const { data: keymap } = useLiveQuery(q =>
    q
      .from({ keymaps: keymapsCollection })
      .where(({ keymaps }) => eq(keymaps.command, command))
      .findOne(),
  )

  useKeydown((event) => {
    const activeKeymap = keymap ?? keymapSchema.parse({ command })

    if (activeKeymap.key === event.key) {
      event.preventDefault()
      handler()
    }
  })
}
