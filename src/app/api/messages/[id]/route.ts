import { auth } from "@/lib/auth"
import { deleteMessage } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const success = await deleteMessage(id, session.user.id)

    if (!success) {
      return NextResponse.json({ error: "留言不存在或无权删除" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete message:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
