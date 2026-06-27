"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Heart, Send, Trash2, Mail } from "lucide-react"

interface Message {
  id: string
  userId: string
  content: string
  type: "MESSAGE" | "DIARY"
  createdAt: string
  userName: string
}

const GESTURE_EMOJIS = ["💌", "🌸", "✨", "🌙", "🍃", "💫", "🌷", "🕊️"]

function NoiseFilter() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.015]">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  )
}

function AmbientBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-32 -left-16 w-[32rem] h-[32rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #fce8e0 0%, transparent 70%)" }}
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-16 w-[28rem] h-[28rem] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, #f5a8a0 0%, transparent 70%)" }}
        animate={{ x: [0, -15, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #d4a574 0%, transparent 70%)" }}
        animate={{ x: [0, 12, -8, 0], y: [0, -8, 14, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-5 pt-6 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={"flex gap-3 " + (i % 2 === 0 ? "justify-end" : "")}>
          {i % 2 !== 0 && (
            <div className="w-8 h-8 rounded-full bg-rose-100 animate-pulse shrink-0" />
          )}
          <div className={"space-y-2 " + (i % 2 === 0 ? "items-end flex flex-col" : "")}>
            <div className={"h-2 bg-rose-100/60 animate-pulse rounded-full " + (i % 2 === 0 ? "w-14" : "w-20")} />
            <div className={"h-10 bg-rose-100/20 animate-pulse rounded-2xl " + (i % 2 === 0 ? "w-44" : "w-56")} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6"
    >
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6"
      >
        <div className="relative">
          <Mail className="w-16 h-16 text-rose-200/50" strokeWidth={1.2} />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <Heart className="w-6 h-6 text-rose-300/40 fill-rose-200/30" strokeWidth={1.2} />
          </motion.div>
        </div>
      </motion.div>

      <p className="text-sm text-rose-300/60 font-[425] tracking-wide leading-relaxed max-w-[16rem]">
        这里还空空的
      </p>
      <p className="text-xs text-rose-200/50 mt-1.5 tracking-wider font-[350]">
        快去写下你想对 TA 说的话吧...
      </p>

      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {GESTURE_EMOJIS.slice(0, 4).map((emoji, i) => (
          <motion.span
            key={emoji}
            className="absolute text-lg"
            style={{
              left: (15 + i * 22) + "%",
              top: (30 + (i % 2) * 20) + "%",
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

function StaggerList({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.05 },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 14 },
  },
  exit: { opacity: 0, y: -12, scale: 0.9, transition: { duration: 0.2 } },
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const [flyingText, setFlyingText] = useState<string | null>(null)
  const [flyKey, setFlyKey] = useState(0)

  const fetchMessages = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setIsRefreshing(true)
    try {
      const res = await fetch("/api/messages")
      if (!res.ok) throw new Error("获取失败")
      const data = await res.json()
      setMessages(data.messages)
    } catch {
      if (!quiet) setError("加载留言失败")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") fetchMessages()
  }, [status, fetchMessages])

  useEffect(() => {
    if (listRef.current && !loading) {
      const el = listRef.current
      requestAnimationFrame(() => { el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }) })
    }
  }, [messages, loading])

  const publicMessages = messages.filter((m) => m.type === "MESSAGE")

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setError("")

    setFlyingText(text)
    setFlyKey((k) => k + 1)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, type: "MESSAGE" }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "发送失败")
      }

      setInput("")
      setTimeout(async () => {
        setFlyingText(null)
        await fetchMessages(true)
      }, 400)
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败")
      setFlyingText(null)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDelete = async (msg: Message) => {
    if (!confirm("确定要删除吗？")) return
    try {
      const res = await fetch("/api/messages/" + msg.id, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "删除失败")
      }
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
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
    <>
      <NoiseFilter />
      <AmbientBlobs />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-4.5rem)]">
        <div className="px-4 pt-10 pb-4 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-2"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-lg">💌</span>
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">
              留言板
            </h1>
            <p className="text-xs text-rose-300/50 mt-1 tracking-wider font-[425]">
              写下想对 TA 说的话
            </p>
          </motion.div>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 pb-4 space-y-5 scrollbar-thin"
        >
          {loading ? (
            <SkeletonList />
          ) : publicMessages.length === 0 ? (
            <EmptyState />
          ) : (
            <StaggerList>
              <AnimatePresence initial={false} mode="popLayout">
                {publicMessages.map((msg) => {
                  const own = msg.userId === session?.user?.id
                  return (
                    <motion.div
                      key={msg.id}
                      variants={cardVariants}
                      layout
                      exit="exit"
                      className={"flex " + (own ? "justify-end" : "justify-start")}
                    >
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        {!own && (
                          <div className="flex items-center gap-2 mb-1.5 ml-0.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-200 to-rose-300 flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0">
                              {msg.userName.charAt(0)}
                            </div>
                            <span className="text-[11px] text-rose-400/60 font-[425] tracking-wide">
                              {msg.userName}
                            </span>
                            <span className="text-[10px] text-rose-200/50">
                              悄悄写下
                            </span>
                          </div>
                        )}

                        <motion.div
                          whileHover={{ y: -1 }}
                          className={"relative group " + (
                            own
                              ? "bg-gradient-to-br from-rose-400/90 to-rose-500/90 text-white rounded-2xl rounded-br-sm shadow-md"
                              : "bg-white/60 backdrop-blur-sm text-gray-700 rounded-2xl rounded-bl-sm shadow-[0_2px_12px_rgba(245,168,160,0.08)] border border-white/40"
                          )}
                        >
                          <div className="px-4 py-3">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div
                              className={"flex items-center gap-1.5 mt-2 " + (
                                own ? "justify-end" : "justify-start"
                              )}
                            >
                              <span
                                className={"text-[10px] " + (
                                  own ? "text-white/50" : "text-rose-200/60"
                                ) + " tracking-wider"}
                              >
                                {formatDistanceToNow(new Date(msg.createdAt), {
                                  addSuffix: true,
                                  locale: zhCN,
                                })}
                              </span>
                            </div>
                          </div>

                          {own && (
                            <div className="absolute -top-2 -right-2 flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(msg)
                                }}
                                className="w-5 h-5 rounded-full bg-white/70 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:border-red-200/50 shadow-sm"
                              >
                                <Trash2 className="w-2.5 h-2.5 text-red-300" strokeWidth={2} />
                              </button>
                            </div>
                          )}
                        </motion.div>

                        {own && (
                          <div className="flex justify-end items-center gap-1.5 mt-1 mr-1">
                            <span className="text-[10px] text-rose-200/50 tracking-wider">
                              你说的
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </StaggerList>
          )}

          <div className="h-32" />
        </div>

        <AnimatePresence>
          {flyingText && (
            <motion.div
              key={flyKey}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -160, scale: 1 }}
              exit={{ opacity: 0, y: -220, scale: 0.6 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed left-1/2 -translate-x-1/2 bottom-28 z-30 pointer-events-none"
            >
              <div className="bg-gradient-to-br from-rose-400/90 to-rose-500/90 text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg max-w-[60vw]">
                <p className="text-sm whitespace-pre-wrap break-words line-clamp-2">
                  {flyingText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-20 left-4 right-4 max-w-lg mx-auto z-50 p-3 rounded-xl bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-500 text-xs text-center shadow-lg"
            >
              {error}
              <button
                onClick={() => setError("")}
                className="ml-2 underline hover:no-underline"
              >
                关闭
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isRefreshing && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-rose-200 border-t-rose-400 rounded-full"
            />
          </div>
        )}

        <motion.div
          ref={inputContainerRef}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
          className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-30"
        >
          <div
            className={
              "flex items-end gap-2 rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md border transition-all duration-300 " +
              (isFocused
                ? "bg-white/70 border-rose-200/60 shadow-rose-200/20"
                : "bg-white/60 border-white/40 shadow-black/5")
            }
            style={{
              boxShadow: isFocused
                ? "0 0 0 3px rgba(245,168,160,0.12), 0 8px 24px rgba(245,168,160,0.10)"
                : "0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="写下你想说的话..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-1 py-1 text-sm text-gray-700 placeholder:text-gray-300/70 focus:outline-none transition-all duration-200 max-h-28 leading-relaxed"
            />

            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              animate={
                input.trim() && !sending
                  ? {
                      scale: 1,
                      x: 0,
                      backgroundColor: "rgba(245,168,160,1)",
                      color: "rgba(255,255,255,1)",
                    }
                  : {
                      scale: 0.92,
                      x: 0,
                      backgroundColor: "rgba(229,231,235,0.6)",
                      color: "rgba(209,213,219,1)",
                    }
              }
              whileHover={
                input.trim() && !sending
                  ? { scale: 1.08, x: 2 }
                  : {}
              }
              whileTap={input.trim() && !sending ? { scale: 0.9 } : {}}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                mass: 0.6,
              }}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Send className="w-4 h-4" strokeWidth={2} />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

