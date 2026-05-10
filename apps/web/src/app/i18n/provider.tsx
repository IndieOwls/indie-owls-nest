import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppSelector } from '../../store'
import { selectMeta } from '../../store/meta'

/* ── Supported locales ───────────────────────────────────────── */
/* "ud" is dev-only — never shipped to production.               */

const DEV = import.meta.env.DEV
const SUPPORTED = DEV ? (['en', 'ud'] as const) : (['en'] as const)

/* ── Lazy-loaded catalog map ──────────────────────────────────── */
/* Vite statically analyzes these for code-splitting.             */

const catalogs: Record<string, () => Promise<any>> = {
  en: () => import('./locales/en.po'),
  ...(DEV && { ud: () => import('./locales/ud.po') }),
}

/* ── Helpers ──────────────────────────────────────────────────── */

function isSupported(locale: string): boolean {
  return (SUPPORTED as readonly string[]).includes(locale)
}

async function activateLocale(locale: string) {
  const { messages } = await catalogs[locale]()
  i18n.load(locale, messages)
  i18n.activate(locale)
}

/** Pick the best supported locale from an ordered list of candidates. */
function pickLocale(...candidates: (string | undefined | null)[]): string {
  for (const c of candidates) {
    if (c && isSupported(c)) return c
    // Also check just the language subtag (e.g. "en-US" → "en")
    const tag = c?.split('-')[0]
    if (tag && isSupported(tag)) return tag
  }
  return 'en'
}

/* ── Provider ─────────────────────────────────────────────────── */

export function I18nAppProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false)
  // Track whether preferences has already been applied so we don't
  // fight the user if they later change the browser locale.
  const appliedPreferred = useRef(false)

  // Initial locale detection (browser → env → en)
  useEffect(() => {
    const locale = pickLocale(
      navigator.language,
      import.meta.env.VITE_LOCALE,
    )
    activateLocale(locale).then(() => setLoaded(true))
  }, [])

  // Once preferences arrive from the meta resolver, switch to the
  // user's preferred locale if one is stored.
  const preferences = useAppSelector(selectMeta).preferences

  useEffect(() => {
    if (!loaded || appliedPreferred.current || !preferences?.preferences) return

    const preferred = (preferences.preferences as Record<string, unknown>)
      ?.locale as string | undefined

    if (preferred && preferred !== i18n.locale && isSupported(preferred)) {
      activateLocale(preferred)
    }

    appliedPreferred.current = true
  }, [loaded, preferences])

  if (!loaded) return null

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
