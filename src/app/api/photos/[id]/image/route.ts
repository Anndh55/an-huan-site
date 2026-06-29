import { auth } from "@/lib/auth"
import { getPhotoById } from "@/lib/db"
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
    const photo = await getPhotoById(id)
    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 })
    }

    const matches = photo.imageUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) {
      return new Response("Invalid image", { status: 500 })
    }

    const buf = Buffer.from(matches[2], "base64")
    return new Response(buf, {
      headers: {
        "Content-Type": matches[1],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Failed to serve image:", error)
    return NextResponse.json({ error: "获取图片失败" }, { status: 500 })
  }
}
