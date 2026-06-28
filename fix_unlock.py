import os

# Fix route.ts
path = "src/app/api/time-capsules/route.ts"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    "      unlockDate.toISOString()",
    "      unlockAt"
)
# Remove past-time validation (4 lines)
c = c.replace(
    '    if (unlockDate <= new Date()) {\n      return NextResponse.json({ error: "\u89e3\u9501\u65f6\u95f4\u5fc5\u987b\u5728\u672a\u6765" }, { status: 400 })\n    }',
    ""
)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("route.ts fixed")

# Fix [id]/route.ts
path2 = "src/app/api/time-capsules/[id]/route.ts"
with open(path2, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    "      updates.unlockAt = unlockDate.toISOString()",
    "      updates.unlockAt = unlockAt"
)
c = c.replace(
    '    if (unlockDate <= new Date()) {\n        return NextResponse.json({ error: "\u89e3\u9501\u65f6\u95f4\u5fc5\u987b\u5728\u672a\u6765" }, { status: 400 })\n      }',
    ""
)

with open(path2, "w", encoding="utf-8") as f:
    f.write(c)
print("[id]/route.ts fixed")

# Now fix db.ts: getVisibleCapsules - compare in JS instead of SQL
path3 = "src/lib/db.ts"
with open(path3, "r", encoding="utf-8") as f:
    c = f.read()

old_fn = """export async function getVisibleCapsules(currentUserId: string): Promise<MessageRow[]> {
  const db = getDb()
  const { rows } = await db.execute({
    sql: 'SELECT m.*, u.name as userName FROM "Message" m JOIN "User" u ON u.id = m.userId WHERE m.type = ? OR (m.type = ? AND m.userId = ?) ORDER BY m.createdAt DESC',
    args: ["MESSAGE", "DIARY", currentUserId],
  })
  return rows as unknown as MessageRow[]
}

export async function deleteMessage"""
new_fn = """export async function getVisibleCapsules(userId: string): Promise<CapsuleRow[]> {
  const db = getDb()
  const now = new Date().toISOString()
  const { rows } = await db.execute({
    sql: 'SELECT tc.*, fu.name as fromUserName, tu.name as toUserName FROM "TimeCapsule" tc JOIN "User" fu ON fu.id = tc.fromUserId JOIN "User" tu ON tu.id = tc.toUserId WHERE tc.fromUserId = ? OR (tc.toUserId = ? AND tc.unlockAt <= ?) ORDER BY tc.unlockAt ASC',
    args: [userId, userId, now],
  })
  return rows as unknown as CapsuleRow[]
}

export async function deleteMessage"""

# But this is getting complex. Let me take a simpler approach.
print("Will fix getVisibleCapsules separately")
