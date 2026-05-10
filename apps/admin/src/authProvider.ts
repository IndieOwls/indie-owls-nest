import type { AuthProvider } from '@refinedev/core'
import { csrfHeaders } from './csrf'

const TAG_V1 = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TAG_V1) ?? 'YYYY-MM-DD'
const API_PREFIX = `api/${TAG_V1}`
const AUTH_API = `/${API_PREFIX}/auth`
const GRAPHQL_API = `/${API_PREFIX}/graphql`

export const authProvider: AuthProvider = {
  login: async ({ username, email, password }) => {
    const res = await fetch(`${AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    })
    if (!res.ok) return { success: false, error: new Error('Invalid credentials') }
    return { success: true, redirectTo: '/' }
  },

  logout: async () => {
    await fetch(`${AUTH_API}/logout`, {
      method: 'POST',
      headers: { ...csrfHeaders() },
      credentials: 'include',
    })
    return { success: true, redirectTo: '/login' }
  },

  check: async () => {
    try {
      const res = await fetch(GRAPHQL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          query: 'query { meta { user { id username role email } } }',
        }),
      })
      const json = await res.json()
      if (json.data?.meta?.user) return { authenticated: true }
      return { authenticated: false, redirectTo: '/login' }
    } catch {
      return { authenticated: false, redirectTo: '/login' }
    }
  },

  getIdentity: async () => {
    try {
      const res = await fetch(GRAPHQL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          query: 'query { meta { user { id username displayName email role } } }',
        }),
      })
      const json = await res.json()
      return json.data?.meta?.user ?? null
    } catch {
      return null
    }
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true }
    }
    return {}
  },
}
