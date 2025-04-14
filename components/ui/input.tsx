import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#1A2333] ring-offset-white transition-colors placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:border-[#467FF7] focus-visible:ring-2 focus-visible:ring-[#EBF2FF] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 