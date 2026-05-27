import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce focus:ring-offset-2" +
  " hover-elevate ",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-matrice-bleu-nuit text-matrice-ivoire shadow-xs",
        secondary:
          "border-transparent bg-matrice-sable text-matrice-encre",
        destructive:
          "border-transparent bg-matrice-error text-white shadow-xs",
        outline: "border-matrice-encre/20 text-matrice-encre",
        premium: "border-transparent bg-essuf-or text-matrice-encre",
        creator: "border-transparent bg-essuf-or text-matrice-encre",
        beta: "border-transparent bg-matrice-terracotta text-white",
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
