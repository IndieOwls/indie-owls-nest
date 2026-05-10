const TAG_V1 = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TAG_V1) ?? 'YYYY-MM-DD'
const API_PREFIX = `api/${TAG_V1}`

export const AUTH_API = `/${API_PREFIX}/auth`

const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

/** Read the CSRF token from the non-httpOnly cookie set by the server. */
function getCsrfToken(): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`))
  return match?.[1]
}

/** Headers required for CSRF-protected requests. Include these in every mutating fetch. */
export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken()
  return token ? { [CSRF_HEADER]: token } : {}
}
