 import { auth } from "@/lib/auth"
 import { deleteAnniversary, updateAnniversary, getAnniversaryById } from "@/lib/db"
 import { NextResponse } from "next/server"
 
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
     const { title, date } = body
 
     if (!title || typeof title !== "string" || title.trim().length === 0) {
       return NextResponse.json({ error: "标题不能为空" }, { status: 400 })
     }
 
     if (!date || typeof date !== "string") {
       return NextResponse.json({ error: "日期不能为空" }, { status: 400 })
     }
 
     await updateAnniversary(id, title.trim(), date)
     return NextResponse.json({ success: true })
   } catch (error) {
     console.error("Failed to update anniversary:", error)
     return NextResponse.json({ error: "更新纪念日失败" }, { status: 500 })
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
 
     const anniversary = await getAnniversaryById(id)
     if (!anniversary) {
       return NextResponse.json({ error: "纪念日不存在" }, { status: 404 })
     }
 
     // Cannot delete TOGETHER type anniversary
     if (anniversary.type === "TOGETHER") {
       return NextResponse.json({ error: "不能删除在一起纪念日" }, { status: 403 })
     }
 
     await deleteAnniversary(id)
     return NextResponse.json({ success: true })
   } catch (error) {
     console.error("Failed to delete anniversary:", error)
     return NextResponse.json({ error: "删除纪念日失败" }, { status: 500 })
   }
 }
