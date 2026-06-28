import { auth } from "@/lib/auth"
import { createPhoto, getPhotos } from "@/lib/db"
import { uploadToQiniu } from "@/lib/qiniu"
import { NextResponse } from "next/server"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "\u672a\u767b\u5f55" }, { status: 401 })
    }

    const photos = await getPhotos()
    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Failed to fetch photos:", error)
    return NextResponse.json({ error: "\u83b7\u53d6\u7167\u7247\u5931\u8d25" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "\u672a\u767b\u5f55" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const caption = formData.get("caption") as string | null

    if (!file) {
      return NextResponse.json({ error: "\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "\u4ec5\u652f\u6301 JPG\u3001PNG\u3001WebP \u683c\u5f0f" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "\u56fe\u7247\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7 5MB" }, { status: 400 })
    }

    // Generate unique filename
    const ext = EXT_MAP[file.type] || "jpg"
    const timestamp = Date.now()
    const uniqueName = timestamp + "-" + crypto.randomUUID().slice(0, 8) + "." + ext
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Qiniu Cloud instead of local disk
    const imageUrl = await uploadToQiniu(buffer, "photos/" + uniqueName)

    // Create DB record
    const photo = await createPhoto(session.user.id, imageUrl, caption || undefined)

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error("Failed to upload photo:", error)
    return NextResponse.json({ error: "\u4e0a\u4f20\u7167\u7247\u5931\u8d25" }, { status: 500 })
  }
}
