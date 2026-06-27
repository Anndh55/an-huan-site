"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "首页",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.8 : 1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/photos",
    label: "照片",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.8 : 1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "留言",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.8 : 1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: "/anniversaries",
    label: "纪念",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.8 : 1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5.454M19 6v2a3 3 0 01-3 3H5a3 3 0 01-3-3V6a3 3 0 013-3h11a3 3 0 013 3zM7 12h.01M17 12h.01m-6 0h.01" />
      </svg>
    ),
  },
  {
    href: "/time-capsule",
    label: "情书",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 1.8 : 1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-1 pointer-events-none">
      <div className="pointer-events-auto inline-flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/30 shadow-lg shadow-rose-200/10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.a
              key={item.href}
              href={item.href}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3.5 min-w-0 z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gradient-to-b from-rose-100/60 to-rose-200/40 rounded-xl shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.6 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-rose-500" : "text-gray-400 hover:text-rose-300"}`}>
                {item.icon(isActive)}
              </span>
              <span className={`relative z-10 text-[9px] tracking-wider transition-colors duration-200 ${isActive ? "text-rose-500 font-medium" : "text-gray-400"}`}>
                {item.label}
              </span>
            </motion.a>
          );
        })}
      </div>
    </nav>
  );
}
