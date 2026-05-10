import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { fetchMeta, type MetaResponse } from './asyncActions'

export { fetchMeta } from './asyncActions'
export type { MetaResponse } from './asyncActions'

/* ==================================================================
 * SliceKey — Redux slice for the meta resolver.
 *
 * Template guide — when copying to a new slice:
 *   1. Rename `State` and update its shape.
 *   2. Replace `initialState` values.
 *   3. Rename `slice` and its `name` string.
 *   4. Swap `extraReducers` to match your async thunks.
 *   5. Rename the selector.
 *   6. Change the default export.
 * ================================================================== */

// ── State ─────────────────────────────────────────────────────────

export interface State {
  user: MetaResponse['user']
  organizations: MetaResponse['organizations']
  featureFlags: MetaResponse['featureFlags']
  unreadNotifications: number
  serverTime: number | null
  emailVerified: boolean
  hasApiKeys: boolean
  linkedOAuthAccounts: MetaResponse['linkedOAuthAccounts']
  preferences: MetaResponse['preferences']

  /** True while the initial fetch is in flight. */
  loading: boolean
  /** Human-readable error message, or null. */
  error: string | null
}

// ── Initial State ─────────────────────────────────────────────────

export const initialState: State = {
  user: null,
  organizations: [],
  featureFlags: [],
  unreadNotifications: 0,
  serverTime: null,
  emailVerified: false,
  hasApiKeys: false,
  linkedOAuthAccounts: [],
  preferences: null,
  loading: false,
  error: null,
}

// ── Slice ─────────────────────────────────────────────────────────

export const slice = createSlice({
  name: 'meta',
  initialState,
  reducers: {
    /** Reset the entire slice to its initial state (e.g. on logout). */
    clearMeta() {
      return initialState
    },

    /** Optimistically update the unread notification count. */
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadNotifications = action.payload
    },
  },

  extraReducers: (builder) => {
    builder
      // ── fetchMeta ────────────────────────────────────────────
      .addCase(fetchMeta.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMeta.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.organizations = action.payload.organizations
        state.featureFlags = action.payload.featureFlags
        state.unreadNotifications = action.payload.unreadNotifications
        state.serverTime = action.payload.serverTime
        state.emailVerified = action.payload.emailVerified
        state.hasApiKeys = action.payload.hasApiKeys
        state.linkedOAuthAccounts = action.payload.linkedOAuthAccounts
        state.preferences = action.payload.preferences
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? 'An unknown error occurred'
      })
  },
})

// ── Actions (synchronous) ─────────────────────────────────────────

export const { clearMeta, setUnreadCount } = slice.actions

// ── Selectors ─────────────────────────────────────────────────────

export const selectMeta = (state: RootState) => state.meta

// ── Reducer ───────────────────────────────────────────────────────

export default slice.reducer
