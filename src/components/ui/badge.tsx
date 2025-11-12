import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0070F3] text-white hover:bg-[#0060D8]",
        secondary:
          "border-transparent bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#666666] dark:text-[#888888] hover:bg-[#EAEAEA] dark:hover:bg-[#333333]",
        destructive:
          "border-transparent bg-[#EE0000] text-white hover:bg-[#CC0000]",
        success:
          "bg-[#E6F7FF] dark:bg-[#0A1A2A] text-[#0070F3] dark:text-[#50E3C2] border-[#BAE7FF] dark:border-[#1A3A4A]",
        error:
          "bg-[#FFEEEE] dark:bg-[#2A0A0A] text-[#EE0000] dark:text-[#FF6B6B] border-[#FFCCCC] dark:border-[#4A0A0A]",
        warning:
          "bg-[#FFF7E6] dark:bg-[#2A1A0A] text-[#F5A623] dark:text-[#FFB84D] border-[#FFE7BA] dark:border-[#4A2A0A]",
        outline: "text-black dark:text-white border-[#EAEAEA] dark:border-[#333333]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
