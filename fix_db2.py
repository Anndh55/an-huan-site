with open("D:/project/an_huan/an-huan-site/src/lib/db.ts", "r", encoding="utf-8") as f:
    c = f.read()
old = '/\\b([a-z]+[A-Z][a-zA-Z0-9]*)\\b/g'
new = '/(?<!")(' + '\\b[a-z]+[A-Z][a-zA-Z0-9]*\\b)/g'
c = c.replace(old, new)
with open("D:/project/an_huan/an-huan-site/src/lib/db.ts", "w", encoding="utf-8") as f:
    f.write(c)
print("Fixed")
