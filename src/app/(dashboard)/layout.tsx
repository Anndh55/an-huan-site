import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import BottomNav from "../../components/BottomNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-[#fef9f5] via-white to-[#fef6f2]">
      <main className="flex-1 pb-24 relative z-10 overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
