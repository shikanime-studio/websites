import { useEffect, useRef } from 'react'

export function useKeydown(handler: (event: KeyboardEvent) => void) {
  const savedHandlerRef = useRef(handler)

  useEffect(() => {
    savedHandlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      savedHandlerRef.current(event)
    }

    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [])
}
