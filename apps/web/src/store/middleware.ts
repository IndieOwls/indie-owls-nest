import type { Middleware, UnknownAction } from '@reduxjs/toolkit'

/** Logs action type and payload in development. */
const loggerMiddleware: Middleware = () => (next) => (action) => {
  if (import.meta.env.DEV) {
    const a = action as UnknownAction
    console.debug(`[redux] ${a.type}`, a.payload)
  }
  return next(action)
}

export const middleware = [loggerMiddleware] as const
