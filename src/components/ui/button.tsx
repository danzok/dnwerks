import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 vercel-transition",
  {
    variants: {
      variant: {
        default: "bg-[#0070F3] hover:bg-[#0060D8] text-white border-transparent rounded-lg",
        destructive:
          "bg-[#EE0000] hover:bg-[#CC0000] text-white border-transparent rounded-lg",
        outline:
          "border-[#EAEAEA] dark:border-[#333333] bg-white dark:bg-[#111111] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-black dark:text-white rounded-lg",
        secondary:
          "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#666666] dark:text-[#888888] hover:bg-[#EAEAEA] dark:hover:bg-[#333333] rounded-lg",
        ghost: "hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-black dark:text-white rounded-lg",
        link: "text-[#0070F3] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-lg",
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
