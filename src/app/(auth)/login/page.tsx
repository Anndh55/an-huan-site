"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import HeartLock from "@/components/HeartLock";
import FiberInput from "@/components/FiberInput";

// ── Starburst particle for exit animation ─────────────────────
function Sparkle({ delay, angle, distance }: { delay: number; angle: number; distance: number }) {
  const r = (angle * Math.PI) / 180;
  const x = Math.cos(r) * distance;
  const y = Math.sin(r) * distance;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-rose-200/60"
      style={{ x: "-50%", y: "-50%" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 0], opacity: [0, 0.8, 0], x, y }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    />
  );
}

// ── Ripple ring ───────────────────────────────────────────────
function RippleRing({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-rose-300/40 pointer-events-none"
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 12, opacity: 0 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    />
  );
}

// ── Keyboard hint ─────────────────────────────────────────────
const KEY_DISPLAY = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform) ? "?" : "Enter";

// ═════════════════════════════════════════════════════════════
export default function LoginPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "form" | "exiting">("idle");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  // ── Trigger the unlock ceremony ───────────────────────────
  const handleUnlock = useCallback(() => {
    if (phase !== "idle") return;
    setClicked(true);
    setRippleKey((k) => k + 1);
    // After a brief spring settle, show the form
    setTimeout(() => setPhase("form"), 650);
  }, [phase]);

  // ── Keydown handler for Enter key ─────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && phase === "idle") {
        handleUnlock();
      }
    },
    [phase, handleUnlock]
  );

  // ── Submit handler ────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("纪念日密码不正确，再试试吧");
      return;
    }

    // ── Login success — begin exit ceremony! ──────────────
    setPhase("exiting");
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/");
    router.refresh();
  }

  // ── Banner for error state ─────────────────────────────────
  const [showError, setShowError] = useState(false);
  const handleFormError = useCallback((msg: string) => {
    setError(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[60vh] select-none"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* ── Ripple overlay (only during unfold) ─────────────── */}
      {clicked && phase !== "exiting" && (
        <div className="fixed inset-0 pointer-events-none z-20" key={rippleKey}>
          <RippleRing delay={0} />
          <RippleRing delay={0.15} />
          <RippleRing delay={0.3} />
        </div>
      )}

      {/* ── EXIT OVERLAY — expanding circle reveal ─────────── */}
      <AnimatePresence mode="wait">
        {phase === "exiting" ? (
          <motion.div
            key="exit-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(150% at 50% 50%)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Warm gradient curtain */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-amber-50 to-rose-300" />

            {/* Starburst sparkles */}
            {Array.from({ length: 40 }, (_, i) => (
              <Sparkle
                key={i}
                delay={i * 0.03}
                angle={i * 37 + Math.random() * 10}
                distance={60 + Math.random() * 160}
              />
            ))}

            {/* Center glow */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-rose-100/40 blur-3xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* "进入中..." text */}
            <motion.p
              className="relative z-10 text-rose-400/70 text-sm tracking-[0.3em] font-[425]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              欢迎回家
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="login-content"
            className="relative z-10 flex flex-col items-center w-full"
          >
            {/* ═══════ Top section: title + heart lock ═══════ */}
           <motion.div
             className="flex flex-col items-center mb-2"
              layout
             animate={phase === "form" ? { y: -10 } : { y: 0 }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 20,
                mass: 0.8,
              }}
            >
              {/* Title */}
              <motion.h1
                className="text-[2.5rem] font-light tracking-[0.4em] select-none leading-[1.15]"
                style={{
                  background:
                    "linear-gradient(135deg, #e07a72 0%, #d4a574 40%, #f5a8a0 70%, #e07a72 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% 200%",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                安 &amp; 煊
              </motion.h1>

              {/* Subtitle */}
              <motion.p
              className="text-[10px] text-rose-300/30 tracking-[0.42em] mt-2 font-[350]"
                animate={phase === "form" ? { opacity: 0.3 } : { opacity: 0.6 }}
              >
                我们的小屋
              </motion.p>

              {/* Heart lock */}
             <motion.div
               className="mt-6"
                layout
               animate={
                  phase === "form"
                    ? { y: -6, scale: 0.75 }
                    : { y: 0, scale: 1 }
                }
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                  mass: 0.8,
                }}
              >
                <HeartLock
                  unlocked={false}
                  size={110}
                  onClick={phase === "idle" ? handleUnlock : undefined}
                />
              </motion.div>
            </motion.div>

            {/* ═══════ Idle hint text ═══════ */}
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="hint"
                  className="flex flex-col items-center gap-5 mt-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Hint sub-text */}
                  <motion.p
                    className="text-xs text-rose-300/50 tracking-[0.25em] font-[350]"
                    animate={{ opacity: [0.35, 0.65, 0.35] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    输入我们的纪念日密码，唤醒小屋
                  </motion.p>

                  {/* "开启回忆" button */}
                 <motion.button
                   onClick={handleUnlock}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(245,168,160,0.18)" }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative px-10 py-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/30 text-sm text-rose-400/70 tracking-[0.2em] font-[425] hover:bg-white/50 hover:border-rose-300/30 hover:text-rose-500/80 transition-all duration-500 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      开启回忆
                      <kbd className="text-[11px] text-rose-300/40 font-[350] tracking-wider bg-white/20 px-2 py-0.5 rounded-lg">
                        {KEY_DISPLAY}
                      </kbd>
                    </span>
                    {/* Hover shimmer */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════ Form (revealed after unlock) ═══════ */}
            <AnimatePresence>
              {phase === "form" && (
                <motion.div
                  key="form-panel"
                  className="w-full mt-2"
                  initial={{ opacity: 0, scale: 0.85, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 20,
                    mass: 0.9,
                    delay: 0.05,
                  }}
                >
                  {/* Glassmorphism card */}
                    <div className="rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 shadow-xl shadow-rose-200/10 px-6 py-7">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <FiberInput
                        id="phone"
                        label="我们认识啦"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="例如：2026320"
                        autoComplete="tel"
                        autoFocus
                        required
                      />

                      <FiberInput
                        id="password"
                        label="恋爱之日"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="例如：2026525"
                        autoComplete="current-password"
                        required
                      />

                      {/* Error */}
                      {error && (
                        <motion.p
                          key={error}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-red-300/80 text-center tracking-wider"
                        >
                          {error}
                        </motion.p>
                      )}

                      {/* Submit */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="group relative w-full py-3 rounded-xl overflow-hidden text-sm font-[425] tracking-[0.15em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          style={{
                            background:
                              "linear-gradient(135deg, #f5a8a0, #e07a72, #d4a574)",
                            backgroundSize: "200% 200%",
                          }}
                          animate={
                            loading
                              ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                              : {}
                          }
                          transition={
                            loading
                              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                              : {}
                          }
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                            {loading ? (
                              <>
                                <svg
                                  className="w-4 h-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                                验证中...
                              </>
                            ) : (
                              <>
                                <span>进入小屋</span>
                                <svg
                                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </>
                            )}
                          </span>
                        </motion.button>
                      </motion.div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
