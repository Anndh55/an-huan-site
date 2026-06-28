import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import crypto from "crypto"

async function main() {
  console.log("Creating tables...");

  // --- User ---
  await sql`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "phone" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "avatarUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `

  // --- Message ---
  await sql`
    CREATE TABLE IF NOT EXISTS "Message" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'MESSAGE',
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `

  // --- Photo ---
  await sql`
    CREATE TABLE IF NOT EXISTS "Photo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "caption" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `

  // --- Anniversary ---
  await sql`
    CREATE TABLE IF NOT EXISTS "Anniversary" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "date" TIMESTAMP NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'TOGETHER',
      "isLunar" BOOLEAN NOT NULL DEFAULT FALSE,
      "lunarMonth" INTEGER,
      "lunarDay" INTEGER,
      "repeated" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `

  // --- TimeCapsule ---
  await sql`
    CREATE TABLE IF NOT EXISTS "TimeCapsule" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "fromUserId" TEXT NOT NULL,
      "toUserId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "unlockAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE,
      FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `

  console.log("Tables created. Seeding data...");

  // === Seed Users (idempotent via ON CONFLICT) ===
  const password = await bcrypt.hash("2026525", 10);
  const anUser = { id: crypto.randomUUID(), name: '�? };
  const huanUser = { id: crypto.randomUUID(), name: '�? };

  await sql`
    INSERT INTO "User" ("id", "phone", "password", "name")
    VALUES (${anUser.id}, '2026320', ${password}, ${anUser.name})
    ON CONFLICT (phone) DO NOTHING
  `

  await sql`
    INSERT INTO "User" ("id", "phone", "password", "name")
    VALUES (${huanUser.id}, '2026319', ${password}, ${huanUser.name})
    ON CONFLICT (phone) DO NOTHING
  `

  // Fetch actual user records (in case they already existed)
  const { rows: users } = await sql`SELECT id, name, phone FROM "User" ORDER BY phone`;
  const an = users.find((u: any) => u.phone === "2026320")!;
  const huan = users.find((u: any) => u.phone === "2026319")!;

  // === Seed TOGETHER Anniversary (idempotent via existence check) ===
  const { rows: existingAnn } = await sql`
    SELECT id FROM "Anniversary"
    WHERE type = 'TOGETHER' AND "userId" = ${an.id}
    LIMIT 1
  `;

  if (existingAnn.length === 0) {
    await sql`
      INSERT INTO "Anniversary" ("id", "userId", "title", "date", "type", "isLunar", "repeated")
      VALUES (
        ${crypto.randomUUID()},
        ${an.id},
        '在一起那�?,
        '2024-01-01T00:00:00.000Z',
        'TOGETHER',
        FALSE,
        TRUE
      )
    `;
    console.log("Created TOGETHER anniversary.");
  } else {
    console.log("TOGETHER anniversary already exists.");
  }

  // === Seed Welcome Message (idempotent via content check) ===
  const welcomeContent = '欢迎来到安焕小屋！这是我们的专属空间�?;
  const { rows: existingMsg } = await sql`
    SELECT id FROM "Message"
    WHERE content = ${welcomeContent} AND "userId" = ${an.id}
    LIMIT 1
  `;

  if (existingMsg.length === 0) {
    await sql`
      INSERT INTO "Message" ("id", "userId", "content", "type")
      VALUES (${crypto.randomUUID()}, ${an.id}, ${welcomeContent}, 'MESSAGE')
    `;
    console.log("Created welcome message.");
  } else {
    console.log("Welcome message already exists.");
  }

  console.log("Seed complete! Users:");
  for (const user of users) {
    console.log("  - " + user.name + " (" + user.phone + ")");
  }
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
