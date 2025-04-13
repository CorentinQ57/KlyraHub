import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-medium text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-klyra disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-btn-primary border border-[#467FF7] text-white hover:bg-klyra-600 active:translate-y-0.5 [box-shadow:0_10px_12px_-2px_rgba(47,84,163,0.25),inset_0_-12px_8px_-10px_rgba(255,255,255,0.5)] hover:[box-shadow:0_12px_16px_-2px_rgba(47,84,163,0.3),inset_0_-12px_8px_-10px_rgba(255,255,255,0.6)] active:[box-shadow:0_5px_8px_-2px_rgba(47,84,163,0.2),inset_0_-8px_6px_-8px_rgba(255,255,255,0.4)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-klyra bg-white text-klyra shadow-sm hover:bg-klyra-50",
        secondary:
          "bg-white text-klyra-text-medium border border-input shadow-sm hover:bg-muted",
        ghost: "hover:bg-klyra-50 hover:text-klyra",
        link: "text-klyra underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1 text-xs",
        lg: "h-12 px-8 py-4 text-lg",
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
