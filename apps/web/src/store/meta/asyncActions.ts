import { createAsyncThunk } from '@reduxjs/toolkit'

/* ==================================================================
 * ThunkKey — Async thunk for the meta resolver.
 *
 * Replace this file when copying to a new slice:
 *   1. Update the GraphQL query to match your resolver.
 *   2. Update the response types in the slice's State.
 *   3. Rename the thunk and the action type prefix.
 * ================================================================== */

const META_QUERY = `
  query GetMeta {
    meta {
      user {
        id
        username
        displayName
        email
        role
        tier
        completedOnboarding
        createdAt
      }
      organizations {
        id
        name
        slug
        tier
        logoUrl
        createdAt
      }
      featureFlags {
        id
        name
        description
        enabled
        allowedRoles
      }
      unreadNotifications
      serverTime
      emailVerified
      hasApiKeys
      linkedOAuthAccounts {
        id
        provider
        providerAccountId
        createdAt
      }
      preferences {
        id
        preferences
      }
    }
  }
`

export const fetchMeta = createAsyncThunk(
  'meta/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ query: META_QUERY }),
      })

      const json = await res.json()

      if (!res.ok || json.errors) {
        return rejectWithValue(
          json.errors?.[0]?.message ?? 'Failed to load meta',
        )
      }

      return json.data.meta as MetaResponse
    } catch (err) {
      return rejectWithValue((err as Error).message)
    }
  },
)

/* ── Response shape (server → client, camelCased by GraphQL convention) ── */

export interface MetaResponse {
  user: {
    id: string
    username: string
    displayName: string
    email: string
    role: string
    tier: string
    completedOnboarding: boolean
    createdAt: string
  } | null
  organizations: Array<{
    id: string
    name: string
    slug: string
    tier: string
    logoUrl: string | null
    createdAt: string
  }>
  featureFlags: Array<{
    id: string
    name: string
    description: string | null
    enabled: boolean
    allowedRoles: string[]
  }>
  unreadNotifications: number
  serverTime: number
  emailVerified: boolean
  hasApiKeys: boolean
  linkedOAuthAccounts: Array<{
    id: string
    provider: string
    providerAccountId: string
    createdAt: string
  }>
  preferences: {
    id: number
    preferences: Record<string, unknown>
  } | null
}
