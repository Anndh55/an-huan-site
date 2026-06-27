import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

async function main() {
  const libsql = createClient({ url: 'file:./prisma/dev.db' })

  // Create tables matching Prisma schema exactly
  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "phone" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "avatarUrl" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Message" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'MESSAGE',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id")
    )
  `)

  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Photo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "caption" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id")
    )
  `)

  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Anniversary" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "date" DATETIME NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'TOGETHER',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id")
    )
  `)

  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "TimeCapsule" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "fromUserId" TEXT NOT NULL,
      "toUserId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "unlockAt" DATETIME NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("fromUserId") REFERENCES "User"("id"),
      FOREIGN KEY ("toUserId") REFERENCES "User"("id")
    )
  `)

  // Seed users
  const password = await bcrypt.hash('password123', 10)

  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "User" ("id", "phone", "password", "name") VALUES (?, ?, ?, ?)`,
    args: [crypto.randomUUID(), '13800138001', password, '安'],
  })

  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "User" ("id", "phone", "password", "name") VALUES (?, ?, ?, ?)`,
    args: [crypto.randomUUID(), '13800138002', password, '焕'],
  })

  const { rows: users } = await libsql.execute('SELECT name, phone FROM "User"')
  console.log('Database initialized! Users:')
  for (const user of users) {
    console.log(`  - ${user.name} (${user.phone})`)
  }
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})