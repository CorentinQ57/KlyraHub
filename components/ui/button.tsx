import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBF2FF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#467FF7] text-white shadow-sm hover:bg-[#3A70E3]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#1A2333]",
        secondary:
          "bg-[#F8FAFC] text-[#1A2333] hover:bg-[#E2E8F0]",
        ghost:
          "hover:bg-[#F8FAFC] text-[#1A2333]",
        link:
          "text-[#467FF7] underline-offset-4 hover:underline",
        brand:
          "bg-[#467FF7] text-white hover:bg-[#3A70E3]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
