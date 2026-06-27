"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// ── Ambient orbs that follow the mouse ────────────────────────
function AmbientOrbs() {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-1/4 -right-1/4 w-[60vmax] h-[60vmax] rounded-full opacity-[0.15] blur-[120px] transition-all duration-1000 ease-out"
        style={{
          background: "radial-gradient(circle, #f5a8a0, transparent 70%)",
          transform: `translate(${(mouse.x - 0.5) * 30}px, ${(mouse.y - 0.5) * 30}px)`,
        }}
      />
      <div
        className="absolute -bottom-1/3 -left-1/4 w-[50vmax] h-[50vmax] rounded-full opacity-[0.12] blur-[120px] transition-all duration-1000 ease-out"
        style={{
          background: "radial-gradient(circle, #d4a574, transparent 70%)",
          transform: `translate(${(mouse.x - 0.5) * -20}px, ${(mouse.y - 0.5) * -20}px)`,
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-[40vmax] h-[40vmax] rounded-full opacity-[0.08] blur-[100px] transition-all duration-1000 ease-out"
        style={{
          background: "radial-gradient(circle, #fce8e0, transparent 70%)",
          transform: `translate(${(mouse.x - 0.5) * 40}px, ${(mouse.y - 0.5) * 40}px)`,
        }}
      />
    </div>
  );
}

// ── Floating gradient blobs (pure CSS animation) ──────────────
function GradientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
      <div
        className="animate-gradient-drift-1 absolute -top-[20%] -left-[10%] w-[80vmax] h-[80vmax] rounded-full opacity-[0.08] blur-[150px]"
        style={{
          background:
            "radial-gradient(circle at 40% 50%, #f5a8a0 0%, #fce8e0 40%, transparent 70%)",
        }}
      />
      <div
        className="animate-gradient-drift-2 absolute -bottom-[20%] -right-[10%] w-[70vmax] h-[70vmax] rounded-full opacity-[0.1] blur-[140px]"
        style={{
          background:
            "radial-gradient(circle at 60% 50%, #e07a72 0%, #d4a574 40%, transparent 70%)",
        }}
      />
      <div
        className="animate-gradient-drift-3 absolute top-[30%] left-[30%] w-[60vmax] h-[60vmax] rounded-full opacity-[0.06] blur-[160px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #d4a574 0%, #f5a8a0 30%, transparent 70%)",
        }}
      />
    </div>
  );
}

// ── Floating particles (ambient sparkles) ─────────────────────
function FloatingParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: string; delay: string; size: number; duration: string }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: `${5 + Math.random() * 90}%`,
        delay: `${Math.random() * 10}s`,
        size: 1.5 + Math.random() * 2.5,
        duration: `${12 + Math.random() * 10}s`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-rose-300/20"
          style={{
            left: p.x,
            bottom: -10,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -(typeof window !== "undefined" ? window.innerHeight + 20 : 800)],
            opacity: [0, 0.3, 0.4, 0.15, 0],
          }}
          transition={{
            duration: parseFloat(p.duration),
            repeat: Infinity,
            delay: parseFloat(p.delay),
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#fdf6f0] via-[#fef9f5] to-[#fdf0ea]">
      <GradientBlobs />
      <AmbientOrbs />
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        {children}
      </motion.div>
    </div>
  );
}
