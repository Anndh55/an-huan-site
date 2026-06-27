"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  
} from "motion/react"
import { format, differenceInDays } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Heart } from "lucide-react"

interface Anniversary {
  id: string
  userId: string
  title: string
  date: string
  type: "TOGETHER" | "CUSTOM"
  createdAt: string
  userName: string
}

interface DayInfo {
  text: string
  isFuture: boolean
  days: number
}

function getDayInfo(dateStr: string): DayInfo {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = differenceInDays(date, today)
  if (diff > 0) return { text: `距离下次还有 ${diff} 天`, isFuture: true, days: diff }
  if (diff < 0) return { text: `已过 ${Math.abs(diff)} 天`, isFuture: false, days: Math.abs(diff) }
  return { text: "就是今天！", isFuture: false, days: 0 }
}

function AnimatedCounter({ target }: { target: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.8,
      ease: [0.25, 0.1, 0.25, 1],
    })
    return controls.stop
  }, [target, count])

  useEffect(() => {
    return rounded.on("change", setDisplayed)
  }, [rounded])

  return <>{displayed}</>
}

function AmbientLights() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" aria-hidden>
      <div className="absolute -top-8 -left-4 w-48 h-48 bg-gradient-to-br from-rose-300/20 to-pink-400/10 rounded-full blur-3xl animate-gradient-drift-1" />
      <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-gradient-to-tl from-amber-200/20 to-rose-300/10 rounded-full blur-3xl animate-gradient-drift-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-pink-200/15 to-transparent rounded-full blur-2xl animate-gradient-drift-3" />
    </div>
  )
}

function NumberSparkles() {
  const [sparkles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      radius: 50 + Math.random() * 30,
      size: 1.5 + Math.random() * 2,
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {sparkles.map((s) => {
        const rad = (s.angle * Math.PI) / 180
        return (
          <motion.div
            key={s.id}
            className="absolute left-1/2 top-1/2 rounded-full bg-rose-300/25"
            style={{ width: s.size, height: s.size, x: "-50%", y: "-50%" }}
            animate={{
              x: ["-50%", `calc(-50% + ${Math.cos(rad) * s.radius}px)`, "-50%"],
              y: ["-50%", `calc(-50% + ${Math.sin(rad) * s.radius}px)`, "-50%"],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}

function TimelineDot({ index }: { index: number }) {
  return (
    <div className="relative flex items-center justify-center w-5 h-5">
      <motion.div
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2, ease: "easeOut" }}
        className="absolute w-[14px] h-[14px] rounded-full border border-rose-300/35"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.25 + index * 0.08 }}
        className="relative w-[14px] h-[14px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.45)] flex items-center justify-center"
      >
        <svg className="w-[7px] h-[7px] text-white pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
    </div>
  )
}

function DayBadge({ text, isFuture }: { text: string; isFuture: boolean }) {
  return (
    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
      isFuture ? "bg-rose-100/50 text-rose-600" : "bg-pink-100/50 text-pink-600"
    }`}>
      {text}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 p-8">
        <div className="h-3 w-20 bg-rose-200/50 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-16 w-32 bg-rose-200/30 rounded-lg mx-auto mb-3 animate-pulse" />
        <div className="h-3 w-16 bg-rose-200/30 rounded-full mx-auto animate-pulse" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start gap-4 p-5">
          <div className="w-5 h-5 rounded-full bg-rose-200/50 animate-pulse shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-rose-200/50 rounded-full animate-pulse" />
            <div className="h-2.5 w-36 bg-rose-200/30 rounded-full animate-pulse" />
          </div>
          <div className="h-3 w-16 bg-rose-200/30 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function AnniversariesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formDate, setFormDate] = useState("")
  const [saving, setSaving] = useState(false)




 const fetchAnniversaries = useCallback(async () => {
   try {
     const res = await fetch("/api/anniversaries", { cache: "no-store" })
     if (!res.ok) throw new Error("获取失败")
     const data = await res.json()
     setAnniversaries(data.anniversaries)
    } catch {
      setError("加载纪念日失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") fetchAnniversaries()
  }, [status, fetchAnniversaries])

  const coreAnniversary =
    anniversaries.length > 0
      ? anniversaries.find((a) => a.type === "TOGETHER") ||
        anniversaries.reduce((best, curr) => {
          const bestDays = differenceInDays(new Date(), new Date(best.date))
          const currDays = differenceInDays(new Date(), new Date(curr.date))
          return currDays > bestDays ? curr : best
        }, anniversaries[0])
      : null

  const coreDays = coreAnniversary
    ? Math.max(0, differenceInDays(new Date(), new Date(coreAnniversary.date)))
    : 0

  const customAnniversaries = anniversaries.filter((a) => a.type === "CUSTOM")

  const openAddModal = () => {
    setFormTitle("")
    setFormDate("")
    setEditingAnniversary(null)
    setShowAddModal(true)
  }

  const openEditModal = (a: Anniversary) => {
    setEditingAnniversary(a)
    setFormTitle(a.title)
    setFormDate(a.date.split("T")[0])
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!formTitle.trim() || !formDate) return
    setSaving(true)
    setError("")

    try {
     if (editingAnniversary) {
       const res = await fetch(`/api/anniversaries/${editingAnniversary.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ title: formTitle.trim(), date: formDate }),
         cache: "no-store",
       })
       if (!res.ok) {
         const data = await res.json()
         throw new Error(data.error || "更新失败")
       }
     } else {
       const res = await fetch("/api/anniversaries", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ title: formTitle.trim(), date: formDate, type: "CUSTOM" }),
         cache: "no-store",
       })
       if (!res.ok) {
         const data = await res.json()
         throw new Error(data.error || "创建失败")
       }
     }

      setShowAddModal(false)
      setEditingAnniversary(null)
      await fetchAnniversaries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (a: Anniversary) => {
    if (!confirm(`确定要删除「${a.title}」吗？`)) return
    try {
      const res = await fetch(`/api/anniversaries/${a.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "删除失败")
      }
      setAnniversaries((prev) => prev.filter((item) => item.id !== a.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-rose-300 font-[425] tracking-wide text-sm"
        >
          加载中...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-7"
      >
        <h1 className="text-xl font-bold tracking-tight text-gray-800">纪念日</h1>
        <p className="text-xs text-rose-300/60 mt-1 tracking-wide font-[425]">记录我们每一个特别的日子</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-500 text-xs text-center"
          >
            {error}
            <button onClick={() => setError("")} className="ml-2 underline hover:no-underline">关闭</button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {coreAnniversary && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-10 overflow-hidden"
            >
              <div className="relative rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-sm p-8 text-center overflow-hidden">
                <AmbientLights />
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex items-center justify-center gap-1.5 mb-2"
                  >
                    <Heart className="w-3 h-3 text-rose-300/60 fill-rose-300/30" />
                    <p className="text-xs text-rose-400/50 tracking-wide font-[425]">{coreAnniversary.title}</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.15 }}
                    className="relative inline-block"
                  >
                    <h2 className="text-7xl md:text-8xl font-bold leading-none select-none tracking-tighter">
                      <span className="bg-gradient-to-b from-rose-400 via-rose-300 to-amber-200/70 bg-clip-text text-transparent drop-shadow-sm">
                        <AnimatedCounter target={coreDays} />
                      </span>
                    </h2>
                    <NumberSparkles />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-rose-300/60 text-lg tracking-wide mt-0.5"
                  >
                    天
                  </motion.p>

                  {coreAnniversary && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="mt-3 text-[11px] text-rose-300/50 tracking-wider"
                    >
                      {format(new Date(coreAnniversary.date), "yyyy年M月d日", { locale: zhCN })}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-1.5 mt-4"
                  >
                    <span className="w-1 h-1 rounded-full bg-rose-300/30" />
                    <span className="w-1 h-1 rounded-full bg-rose-400/50" />
                    <span className="w-1 h-1 rounded-full bg-rose-300/30" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          <div >
            {customAnniversaries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center justify-center py-14 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
                  className="text-4xl mb-4 opacity-40"
                >
                  <Heart className="w-10 h-10 text-rose-200 fill-rose-200/30" />
                </motion.div>
                <p className="text-gray-400 text-sm font-medium">还没有自定义纪念日</p>
                <p className="text-gray-300 text-xs mt-1 mb-5">添加属于你们的特别日子吧</p>
                <button
                  onClick={openAddModal}
                  className="px-5 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-xs font-medium shadow-md shadow-rose-200/30 hover:shadow-lg hover:shadow-rose-300/30 transition-shadow"
                >
                  添加纪念日
                </button>
              </motion.div>
            ) : (
              <div className="relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  className="absolute left-[1.5px] top-2 w-[2px] bg-gradient-to-b from-rose-300/70 via-rose-200/40 to-transparent rounded-full"
                  style={{ boxShadow: "0 0 6px rgba(244,114,182,0.15), 0 0 12px rgba(244,114,182,0.08)" }}
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.45 } },
                  }}
                  className="space-y-0"
                >
                  {customAnniversaries.map((a, index) => {
                    const dayInfo = getDayInfo(a.date)
                    const dateObj = new Date(a.date)

                    return (
                      <motion.div
                        key={a.id}
                        variants={{
                          hidden: { opacity: 0, y: 28 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        className="group relative flex items-start gap-4 pb-6 last:pb-0"
                      >
                        <div className="relative z-10 flex-shrink-0 pt-1">
                          <TimelineDot index={index} />
                        </div>

                        <motion.div
                          whileHover={{
                            y: -4,
                            boxShadow: "0 8px 24px rgba(244,143,177,0.12), 0 0 0 1px rgba(244,143,177,0.15)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex-1 min-w-0 bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-sm transition-all duration-300 cursor-default"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors leading-snug">
                              {a.title}
                            </h4>
                            <DayBadge text={dayInfo.text} isFuture={dayInfo.isFuture} />
                          </div>

                          <p className="text-[11px] text-gray-400 tracking-wide">
                            {format(dateObj, "yyyy年M月d日", { locale: zhCN })}
                          </p>

                          <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                            <button
                              onClick={() => openEditModal(a)}
                              className="text-[10px] text-rose-400 hover:text-rose-500 transition-colors tracking-wider font-medium"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(a)}
                              className="text-[10px] text-red-400 hover:text-red-500 transition-colors tracking-wider font-medium"
                            >
                              删除
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.5 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={openAddModal}
          className="fixed bottom-24 right-6 w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-full shadow-lg shadow-rose-300/30 flex items-center justify-center transition-shadow hover:shadow-xl hover:shadow-rose-300/40 active:shadow-md z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 flex items-end sm:items-center justify-center backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-700">
                  {editingAnniversary ? "编辑纪念日" : "添加纪念日"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 bg-rose-50 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-gray-500 font-medium mb-1 tracking-wide">纪念日名称</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="例如：第一次约会"
                    className="w-full rounded-lg bg-rose-50/60 border border-rose-200/30 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-rose-300 focus:bg-rose-50/80 transition-all duration-200"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 font-medium mb-1 tracking-wide">日期</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg bg-rose-50/60 border border-rose-200/30 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300 focus:bg-rose-50/80 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-rose-200/50 text-gray-500 text-sm font-medium hover:bg-rose-50/50 transition-all duration-200"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formTitle.trim() || !formDate || saving}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-medium shadow-md shadow-rose-200/30 hover:shadow-lg hover:shadow-rose-300/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      保存中...
                    </span>
                  ) : editingAnniversary ? "保存修改" : "添加"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


