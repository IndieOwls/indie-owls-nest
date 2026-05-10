import { useState, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch { /* quota exceeded or private browsing */ }
        return next
      })
    },
    [key],
  )

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch { /* noop */ }
    setStored(initialValue)
  }, [key, initialValue])

  return [stored, setValue, remove] as const
}
