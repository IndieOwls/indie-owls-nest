const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

function getCsrfToken(): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`))
  return match?.[1]
}

export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken()
  return token ? { [CSRF_HEADER]: token } : {}
}
