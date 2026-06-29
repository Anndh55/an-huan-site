import { auth } from "@/lib/auth"
import { createPhoto, getPhotos } from "@/lib/db"
import { NextResponse } from "next/server"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 15 * 1024 * 1024

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const photos = await getPhotos()
    const list = photos.map(p => ({ ...p, imageUrl: "" }))
    return NextResponse.json({ photos: list })
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ error: "获取照片失败" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const caption = formData.get("caption") as string | null

    if (!file) {
      return NextResponse.json({ error: "请选择图片文件" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 JPG、PNG、WebP 格式" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "图片大小不能超过 5MB" }, { status: 400 })
    }

    // Convert file to base64 data URL and store directly in DB
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const imageUrl = "data:" + file.type + ";base64," + base64

    const photo = await createPhoto(session.user.id, imageUrl, caption || undefined)
    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error("Failed to upload photo:", error)
    return NextResponse.json({ error: "上传照片失败" }, { status: 500 })
  }
}
