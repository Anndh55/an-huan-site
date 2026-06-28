const fs = require("fs");
let c = fs.readFileSync("src/lib/db.ts", "utf8");
const oldSql = `const now = new Date().toISOString()
  const { rows } = await db.execute({
    sql: 'SELECT tc.*, fu.name as fromUserName, tu.name as toUserName FROM "TimeCapsule" tc JOIN "User" fu ON fu.id = tc.fromUserId JOIN "User" tu ON tu.id = tc.toUserId WHERE tc.fromUserId = ? OR (tc.toUserId = ? AND tc.unlockAt <= ?) ORDER BY tc.unlockAt ASC',
    args: [userId, userId, now],
  })
  return rows as unknown as CapsuleRow[]`;
const newSql = `const now = new Date()
  const { rows } = await db.execute({
    sql: 'SELECT tc.*, fu.name as fromUserName, tu.name as toUserName FROM "TimeCapsule" tc JOIN "User" fu ON fu.id = tc.fromUserId JOIN "User" tu ON tu.id = tc.toUserId WHERE tc.fromUserId = ? OR tc.toUserId = ? ORDER BY tc.unlockAt ASC',
    args: [userId, userId],
  })
  const allCapsules = rows as unknown as CapsuleRow[]
  return allCapsules.filter(c => c.fromUserId === userId || (c.toUserId === userId && new Date(c.unlockAt) <= now))`;
const found = c.includes(oldSql);
c = c.replace(oldSql, newSql);
fs.writeFileSync("src/lib/db.ts", c, "utf8");
console.log("Found:", found, "Changed:", c.includes(newSql));
