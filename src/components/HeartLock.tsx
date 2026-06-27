"use client";

import { motion } from "motion/react";

// ── Animated 2D vector heart-lock / energy core ──────────────────
//
// A heart-shaped lock with a keyhole at its center. The outer ring
// breathes softly while the inner core pulses with a warm glow.
// On unlock the heart splits open to release a shower of particles.
// ─────────────────────────────────────────────────────────────────

interface HeartLockProps {
  unlocked?: boolean;
  size?: number;
  onClick?: () => void;
}

export default function HeartLock({
  unlocked = false,
  size = 120,
  onClick,
}: HeartLockProps) {
  const s = size;

  return (
   <motion.button
     onClick={onClick}
      animate={{ y: [0, -3, 0, 2, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
     whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center cursor-pointer bg-transparent border-0 p-0 outline-none select-none"
      style={{ width: s, height: s }}
      aria-label="点击唤醒小屋"
    >
      {/* ── Glow behind the heart ── */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,168,160,0.25) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={
          unlocked
            ? { scale: 2.5, opacity: 0 }
            : {
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.9, 0.6],
              }
        }
        transition={
          unlocked
            ? { duration: 0.8, ease: "easeOut" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* ── SVG Heart Lock ── */}
      <motion.svg
        viewBox="0 0 100 100"
        width={s}
        height={s}
        className="relative z-10 overflow-visible"
        animate={
          unlocked
            ? { scale: 0, rotate: 180, opacity: 0 }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={
          unlocked
            ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.4 }
        }
      >
        <defs>
          <linearGradient id="heart-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5a8a0" />
            <stop offset="50%" stopColor="#e07a72" />
            <stop offset="100%" stopColor="#d4a574" />
          </linearGradient>
          <linearGradient id="heart-grad-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fce8e0" />
            <stop offset="50%" stopColor="#f5a8a0" />
            <stop offset="100%" stopColor="#d4a574" />
          </linearGradient>
          <filter id="heart-soft-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Heart outline (stroke only, breathing) */}
        <motion.path
          d="M50 88 C20 60 6 44 6 28 C6 14 18 4 32 4 C40 4 46 8 50 14 C54 8 60 4 68 4 C82 4 94 14 94 28 C94 44 80 60 50 88Z"
          fill="none"
          stroke="url(#heart-grad-light)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#heart-soft-glow)"
          animate={
            unlocked
              ? { pathLength: 0, opacity: 0 }
              : { pathLength: [0.95, 1, 0.95] }
          }
          transition={
            unlocked
              ? { duration: 0.5 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* Heart fill (with gradient, subtle pulse) */}
        <motion.path
          d="M50 88 C20 60 6 44 6 28 C6 14 18 4 32 4 C40 4 46 8 50 14 C54 8 60 4 68 4 C82 4 94 14 94 28 C94 44 80 60 50 88Z"
          fill="url(#heart-grad)"
          fillOpacity="0.15"
          stroke="none"
          animate={
            unlocked
              ? { fillOpacity: 0 }
              : { fillOpacity: [0.12, 0.22, 0.12] }
          }
          transition={
            unlocked
              ? { duration: 0.5 }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* ── Keyhole ── */}
        <g opacity="0.85">
          {/* Circle part of keyhole */}
          <circle cx="50" cy="42" r="9" fill="none" stroke="url(#heart-grad)" strokeWidth="1.2" />
          {/* Slot part of keyhole */}
          <rect x="47" y="48" width="6" height="10" rx="2" fill="none" stroke="url(#heart-grad)" strokeWidth="1.2" />
          {/* Inner glow in keyhole */}
          <motion.circle
            cx="50"
            cy="42"
            r="6"
            fill="url(#heart-grad-light)"
            opacity="0.2"
            animate={
              unlocked
                ? { r: 12, opacity: 0 }
                : { r: [5, 7, 5], opacity: [0.15, 0.3, 0.15] }
            }
            transition={
              unlocked
                ? { duration: 0.4 }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </g>

        {/* ── Small decorative sparkles around the heart ── */}
        {!unlocked &&
          [0, 72, 144, 216, 288].map((angle, i) => (
            <motion.circle
              key={i}
              cx={50 + 42 * Math.cos((angle * Math.PI) / 180)}
              cy={50 + 42 * Math.sin((angle * Math.PI) / 180)}
              r="1.5"
              fill="#f5a8a0"
              opacity="0.3"
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
      </motion.svg>
    </motion.button>
  );
}
