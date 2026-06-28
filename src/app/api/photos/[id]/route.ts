import { auth } from "@/lib/auth"
import { getPhotoById, deletePhoto as deletePhotoDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "\u672a\u767b\u5f55" }, { status: 401 })
    }

    const { id } = await params

    const photo = await getPhotoById(id)
    if (!photo) {
      return NextResponse.json({ error: "\u7167\u7247\u4e0d\u5b58\u5728" }, { status: 404 })
    }

    if (photo.userId !== session.user.id) {
      return NextResponse.json({ error: "\u53ea\u80fd\u5220\u9664\u81ea\u5df1\u7684\u7167\u7247" }, { status: 403 })
    }

    // Delete DB record only (file is on Qiniu Cloud)
    await deletePhotoDb(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete photo:", error)
    return NextResponse.json({ error: "\u5220\u9664\u7167\u7247\u5931\u8d25" }, { status: 500 })
  }
}
