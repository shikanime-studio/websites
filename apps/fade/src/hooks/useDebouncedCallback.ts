import { useCallback, useEffect, useRef } from 'react'

export interface DebounceOptions {
  delayMs?: number
  maxWaitMs?: number
}

export function useDebouncedCallback<TArgs extends Array<unknown>>(
  callback: (...args: TArgs) => void | Promise<void>,
  options: DebounceOptions = {},
) {
  const { delayMs = 1000, maxWaitMs = 5000 } = options

  const callbackRef = useRef(callback)
  const delayTimerRef = useRef<number | null>(null)
  const maxTimerRef = useRef<number | null>(null)
  const firstCallAtRef = useRef<number | null>(null)
  const latestArgsRef = useRef<TArgs | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (delayTimerRef.current !== null) {
      window.clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
    }
    if (maxTimerRef.current !== null) {
      window.clearTimeout(maxTimerRef.current)
      maxTimerRef.current = null
    }
    firstCallAtRef.current = null
    latestArgsRef.current = null
  }, [])

  const invoke = useCallback(async () => {
    if (!latestArgsRef.current) {
      cancel()
      return
    }

    const args = latestArgsRef.current
    cancel()

    try {
      await callbackRef.current(...args)
    }
    catch {
    }
  }, [cancel])

  const debounced = useCallback(
    (...args: TArgs) => {
      latestArgsRef.current = args
      const now = Date.now()

      if (firstCallAtRef.current === null) {
        firstCallAtRef.current = now
      }

      if (delayTimerRef.current !== null) {
        window.clearTimeout(delayTimerRef.current)
      }

      delayTimerRef.current = window.setTimeout(() => {
        void invoke()
      }, delayMs)

      const firstCallAt = firstCallAtRef.current
      const elapsed = firstCallAt ? now - firstCallAt : 0

      if (elapsed >= maxWaitMs) {
        void invoke()
        return
      }

      if (maxTimerRef.current === null) {
        const remaining = Math.max(0, maxWaitMs - elapsed)
        maxTimerRef.current = window.setTimeout(() => {
          void invoke()
        }, remaining)
      }
    },
    [delayMs, invoke, maxWaitMs],
  )

  const flush = useCallback(() => {
    if (!latestArgsRef.current)
      return
    void invoke()
  }, [invoke])

  useEffect(() => cancel, [cancel])

  return { debounced, cancel, flush }
}
