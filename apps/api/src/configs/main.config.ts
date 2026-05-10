import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join, resolve } from 'path'

// Cascade: OS env vars > .env.{NODE_ENV} > .env
//
// This file is the SINGLE source of truth for environment-derived values.
// Every other file imports named exports from here instead of reading
// process.env directly.
//
// dotenv.config() never overrides existing process.env values, so:
//   OS-level vars always win.
//   .env.{NODE_ENV} values persist through .env loading.

// Determine the project root by walking up from __dirname until we find .env.
// This handles both ts-node (src/ relative) and compiled (dist/src/ relative).
let root = resolve(__dirname, '..')
if (!existsSync(resolve(root, '.env'))) {
  root = resolve(__dirname, '../..')
}

export const env = process.env.NODE_ENV || ''

config({ path: resolve(root, `.env.${env}`), quiet: true })
config({ path: resolve(root, '.env'), quiet: true })

export const PORT = parseInt(process.env.PORT ?? '3000', 10)
export const TAG_V1 = process.env.TAG_V1 ?? 'YYYY-MM-DD'
export const APP_URL = process.env.APP_URL ?? `http://localhost:${PORT}`
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? `http://localhost:${PORT}`

// ── Computed helpers ──
export const rawCorsOrigins = CORS_ORIGIN.split(',').map((o) => o.trim())
export const corsOrigin: string | string[] =
  rawCorsOrigins.length === 1 ? rawCorsOrigins[0] : rawCorsOrigins

// ── Database ──
export const DATABASE_HOST = process.env.DATABASE_HOST
export const DATABASE_PORT = parseInt(process.env.DATABASE_PORT ?? '5432', 10)
export const DATABASE_USER = process.env.DATABASE_USER
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
export const DATABASE_NAME = process.env.DATABASE_NAME
export const DATABASE_SSL = process.env.DATABASE_SSL === 'true'

// ── Redis (required for BullMQ + cache) ──
export const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost'
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379', 10)

// ── Session ──
export const SESSION_DURATION_DAYS = parseInt(process.env.SESSION_DURATION_DAYS ?? '7', 10)
export const COOKIE_NAME = process.env.COOKIE_NAME ?? 'session_token'

// ── Email (Resend) ──
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@indieowls.com'
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''

// ── Stripe ──
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ''
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

// ── File storage ──
export const STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? 'local'
export const STORAGE_LOCAL_PATH = process.env.STORAGE_LOCAL_PATH ?? join(process.cwd(), 'uploads')

// ── S3 (when STORAGE_DRIVER=s3) ──
export const S3_BUCKET = process.env.S3_BUCKET ?? ''
export const S3_REGION = process.env.S3_REGION ?? 'us-east-1'
export const S3_BASE_URL = process.env.S3_BASE_URL ?? ''
export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ?? ''
export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY ?? ''

// ── OAuth ──
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ''
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
export const GOOGLE_OAUTH_CALLBACK_URL = process.env.GOOGLE_OAUTH_CALLBACK_URL ?? ''
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? ''
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? ''
export const GITHUB_OAUTH_CALLBACK_URL = process.env.GITHUB_OAUTH_CALLBACK_URL ?? ''

// ── Organizations ──
export const ORGANIZATION_DOMAIN = process.env.ORGANIZATION_DOMAIN ?? ''

export default () => ({
  port: PORT,
  app: {
    url: APP_URL,
  },
  database: {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    name: DATABASE_NAME,
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  email: {
    from: EMAIL_FROM,
  },
  resend: {
    apiKey: RESEND_API_KEY,
  },
  stripe: {
    secretKey: STRIPE_SECRET_KEY,
    webhookSecret: STRIPE_WEBHOOK_SECRET,
  },
  storage: {
    driver: STORAGE_DRIVER,
    local: {
      path: STORAGE_LOCAL_PATH,
    },
  },
  s3: {
    bucket: S3_BUCKET,
    region: S3_REGION,
    baseUrl: S3_BASE_URL,
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  cors: {
    origin: corsOrigin,
  },
  organization: {
    domain: ORGANIZATION_DOMAIN,
  },
})
