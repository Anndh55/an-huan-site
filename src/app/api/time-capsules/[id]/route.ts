import { auth } from "@/lib/auth"
import { getCapsuleById, updateCapsule, deleteCapsule } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const capsule = await getCapsuleById(id, session.user.id)

    if (!capsule) {
      return NextResponse.json({ error: "时光胶囊不存在" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const isRecipientLocked = capsule.toUserId === session.user.id && capsule.unlockAt > now

    const result = {
      id: capsule.id,
      title: capsule.title,
      content: isRecipientLocked ? null : capsule.content,
      fromUserId: capsule.fromUserId,
      toUserId: capsule.toUserId,
      fromUserName: capsule.fromUserName,
      toUserName: capsule.toUserName,
      unlockAt: capsule.unlockAt,
      createdAt: capsule.createdAt,
      isLocked: isRecipientLocked,
      isSender: capsule.fromUserId === session.user.id,
    }

    return NextResponse.json({ capsule: result })
  } catch (error) {
    console.error("Failed to fetch time capsule:", error)
    return NextResponse.json({ error: "获取时光胶囊失败" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, unlockAt } = body

    const updates: { title?: string; content?: string; unlockAt?: string } = {}

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json({ error: "标题不能为空" }, { status: 400 })
      }
      updates.title = title.trim()
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: "内容不能为空" }, { status: 400 })
      }
      if (content.length > 5000) {
        return NextResponse.json({ error: "内容不能超过5000字" }, { status: 400 })
      }
      updates.content = content.trim()
    }

    if (unlockAt !== undefined) {
      const unlockDate = new Date(unlockAt)
      if (isNaN(unlockDate.getTime())) {
        return NextResponse.json({ error: "解锁时间格式不正确" }, { status: 400 })
      }
  
      updates.unlockAt = unlockAt
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "没有需要更新的字段" }, { status: 400 })
    }

    const capsule = await updateCapsule(id, session.user.id, updates)
    if (!capsule) {
      return NextResponse.json({ error: "胶囊不存在或无权限修改" }, { status: 404 })
    }

    return NextResponse.json({ capsule })
  } catch (error) {
    console.error("Failed to update time capsule:", error)
    return NextResponse.json({ error: "修改时光胶囊失败" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const success = await deleteCapsule(id, session.user.id)

    if (!success) {
      return NextResponse.json({ error: "胶囊不存在或无权限删除" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete time capsule:", error)
    return NextResponse.json({ error: "删除时光胶囊失败" }, { status: 500 })
  }
}
