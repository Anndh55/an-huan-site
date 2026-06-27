 import { auth } from "@/lib/auth"
 import { getAllUsers } from "@/lib/db"
 import { NextResponse } from "next/server"
 
 export async function GET() {
   try {
     const session = await auth()
     if (!session?.user?.id) {
       return NextResponse.json({ error: "未登录" }, { status: 401 })
     }
 
     const users = await getAllUsers()
     return NextResponse.json({ users })
   } catch (error) {
     console.error("Failed to fetch users:", error)
     return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 })
   }
 }
