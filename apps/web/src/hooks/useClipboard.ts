import { useCallback, useEffect, useRef, useState } from 'react'

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const copy = useCallback(async (text: string) => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      timer.current = setTimeout(() => setCopied(false), timeout)
    } catch {
      setCopied(false)
    }
  }, [timeout])

  useEffect(() => {
    return () => clearTimeout(timer.current)
  }, [])

  return { copy, copied } as const
}
