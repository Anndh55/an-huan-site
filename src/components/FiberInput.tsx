"use client"

import { motion } from "motion/react"
import { InputHTMLAttributes, forwardRef } from "react"

interface FiberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const FiberInput = forwardRef<HTMLInputElement, FiberInputProps>(
  ({ label, id, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className="block text-[11px] text-rose-400/70 tracking-wider font-[425] ml-1"
        >
          {label}
        </label>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <input
            id={id}
            ref={ref}
            className={
              "w-full rounded-xl bg-white/50 border border-rose-200/30 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-rose-300 focus:bg-white/70 focus:shadow-sm transition-all duration-300 " +
              className
            }
            {...props}
          />
          {/* Bottom line accent on focus */}
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-rose-300/0 via-rose-300/40 to-rose-300/0 scale-x-0 focus-within:scale-x-100 transition-transform duration-500 origin-center pointer-events-none" />
        </motion.div>
      </div>
    )
  }
)

FiberInput.displayName = "FiberInput"

export default FiberInput
