import { auth } from "@/lib/auth"
import { createMessage, getVisibleMessages } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const messages = await getVisibleMessages(session.user.id)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "获取留言失败" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { content, type } = body

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "内容不能超过2000字" }, { status: 400 })
    }

    if (!["MESSAGE", "DIARY"].includes(type)) {
      return NextResponse.json({ error: "无效的类型" }, { status: 400 })
    }

    const message = await createMessage(session.user.id, content.trim(), type)
    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Failed to create message:", error)
    return NextResponse.json({ error: "发送失败" }, { status: 500 })
  }
}
