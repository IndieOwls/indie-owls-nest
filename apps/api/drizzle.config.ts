const { config } = require('dotenv')
const { resolve } = require('path')
const { existsSync } = require('fs')

// Cascade: .env.{NODE_ENV} > .env
// drizzle-kit runs as a standalone CLI, not through NestJS, so env.ts
// doesn't execute. Load the cascade here so DB credentials resolve
// correctly regardless of environment.
const env = process.env.NODE_ENV || 'development'
const envSpecific = resolve(__dirname, `.env.${env}`)
if (existsSync(envSpecific)) config({ path: envSpecific })
config({ path: resolve(__dirname, '.env') })

// Validate so missing env vars produce a clear message instead of a cryptic crash.
const required = {
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
}
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  throw new Error(
    `Missing required environment variables for database connection:\n` +
    `  ${missing.join(', ')}\n` +
    `Check that apps/api/.env has these values or set them in your shell.`,
  )
}

const { defineConfig } = require('drizzle-kit')

module.exports = defineConfig({
  schema: './src/databases/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.DATABASE_SSL === 'true',
  },
  verbose: true,
  strict: true,
})
