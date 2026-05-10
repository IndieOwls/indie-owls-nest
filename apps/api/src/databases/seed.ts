import '../../env'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as bcrypt from 'bcryptjs'

import * as schema from './schema'
import { UserRole } from '../users/dto/user-role.enum'

const BCRYPT_ROUNDS = 12

async function seed() {
  const sql = postgres({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER ?? 'indie',
    password: process.env.DATABASE_PASSWORD ?? 'indie',
    database: process.env.DATABASE_NAME ?? 'indie',
  })

  const db = drizzle(sql, { schema })

  // Read from env with dev defaults so the script works out of the box locally.
  // Override these in production via environment or .env:
  //   SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
  //   SEED_USER_USERNAME,  SEED_USER_EMAIL,  SEED_USER_PASSWORD
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin'
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@test.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123'

  const userUsername = process.env.SEED_USER_USERNAME ?? 'testuser'
  const userEmail = process.env.SEED_USER_EMAIL ?? 'user@test.com'
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'user123'

  const adminHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS)
  const userHash = await bcrypt.hash(userPassword, BCRYPT_ROUNDS)

  const [admin] = await db
    .insert(schema.users)
    .values({
      username: adminUsername,
      email: adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning()

  const [testUser] = await db
    .insert(schema.users)
    .values({
      username: userUsername,
      email: userEmail,
      passwordHash: userHash,
      role: UserRole.USER,
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning()

  console.log('Seed complete.')
  if (admin) console.log(`  Admin:   ${adminUsername} / ${adminPassword}  (id=${admin.id})`)
  if (testUser) console.log(`  User:    ${userUsername} / ${userPassword}  (id=${testUser.id})`)
  if (!admin && !testUser) console.log('  (users already exist — no rows inserted)')

  await sql.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
