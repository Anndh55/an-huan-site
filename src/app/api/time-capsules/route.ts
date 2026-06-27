import { auth } from "@/lib/auth"
import { getVisibleCapsules, createCapsule } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const capsules = await getVisibleCapsules(session.user.id)
    const currentUserId = session.user.id
    const now = new Date().toISOString()
    const list = capsules.map((c) => ({
      id: c.id,
      title: c.title,
      fromUserId: c.fromUserId,
      toUserId: c.toUserId,
      fromUserName: c.fromUserName,
      toUserName: c.toUserName,
      unlockAt: c.unlockAt,
      createdAt: c.createdAt,
      isLocked: c.toUserId === currentUserId && c.unlockAt > now,
      isSender: c.fromUserId === currentUserId,
    }))

    return NextResponse.json({ capsules: list })
  } catch (error) {
    console.error("Failed to fetch time capsules:", error)
    return NextResponse.json({ error: "获取时光胶囊失败" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, unlockAt, toUserId } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 })
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: "内容不能超过5000字" }, { status: 400 })
    }

    if (!toUserId || typeof toUserId !== "string") {
      return NextResponse.json({ error: "请选择收信人" }, { status: 400 })
    }

    if (!unlockAt || typeof unlockAt !== "string") {
      return NextResponse.json({ error: "请选择解锁时间" }, { status: 400 })
    }

    const unlockDate = new Date(unlockAt)
    if (isNaN(unlockDate.getTime())) {
      return NextResponse.json({ error: "解锁时间格式不正确" }, { status: 400 })
    }

    if (unlockDate <= new Date()) {
      return NextResponse.json({ error: "解锁时间必须在未来" }, { status: 400 })
    }

    const capsule = await createCapsule(
      session.user.id,
      toUserId,
      title.trim(),
      content.trim(),
      unlockAt
    )

    return NextResponse.json({ capsule }, { status: 201 })
  } catch (error) {
    console.error("Failed to create time capsule:", error)
    return NextResponse.json({ error: "创建时光胶囊失败" }, { status: 500 })
  }
}
