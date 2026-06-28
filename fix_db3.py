with open("D:/project/an_huan/an-huan-site/src/lib/db.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Fix: remove time filter from SQL, compare in JS
# Replace the function text
old = "const now = new Date().toISOString()\n  const { rows } = await db.execute({\n    sql: '" + "'SELECT tc.*, fu.name as fromUserName, tu.name as toUserName FROM "TimeCapsule" tc JOIN "User" fu ON fu.id = tc.fromUserId JOIN "User" tu ON tu.id = tc.toUserId WHERE tc.fromUserId = ? OR (tc.toUserId = ? AND tc.unlockAt <= ?) ORDER BY tc.unlockAt ASC" + "'" + ",\n    args: [userId, userId, now],\n  })\n  return rows as unknown as CapsuleRow[]"

new = "const now = new Date()\n  const { rows } = await db.execute({\n    sql: '" + "'SELECT tc.*, fu.name as fromUserName, tu.name as toUserName FROM "TimeCapsule" tc JOIN "User" fu ON fu.id = tc.fromUserId JOIN "User" tu ON tu.id = tc.toUserId WHERE tc.fromUserId = ? OR tc.toUserId = ? ORDER BY tc.unlockAt ASC" + "'" + ",\n    args: [userId, userId],\n  })\n  const allCapsules = rows as unknown as CapsuleRow[]\n  return allCapsules.filter(c => c.fromUserId === userId || (c.toUserId === userId && new Date(c.unlockAt) <= now))"

if old in content:
    content = content.replace(old, new)
    with open("D:/project/an_huan/an-huan-site/src/lib/db.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("db.ts fixed")
else:
    print("old text not found")
    idx = content.find("getVisibleCapsules")
    print(content[idx:idx+500])
