import { useEffect, useRef, type RefObject } from 'react'

type Handler = (event: MouseEvent | TouchEvent) => void

export function useOnClickOutside<T extends HTMLElement>(
  handler: Handler,
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const saved = useRef(handler)

  useEffect(() => {
    saved.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      saved.current(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [])

  return ref
}
