import { auth } from "@/lib/auth"
import { getPhotoById, deletePhoto as deletePhotoDb } from "@/lib/db"
import { NextResponse } from "next/server"
import { unlink } from "node:fs/promises"
import { join } from "node:path"

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

    const photo = await getPhotoById(id)
    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 })
    }

    if (photo.userId !== session.user.id) {
      return NextResponse.json({ error: "只能删除自己的照片" }, { status: 403 })
    }

    // Delete file from disk
    const fileName = photo.imageUrl.replace("/uploads/", "")
    const filePath = join(process.cwd(), "public", "uploads", fileName)
    try {
      await unlink(filePath)
    } catch {
      // File may not exist on disk; still delete the DB record
    }

    await deletePhotoDb(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete photo:", error)
    return NextResponse.json({ error: "删除照片失败" }, { status: 500 })
  }
}
