import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrice-or-fonce focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-matrice-sable disabled:text-matrice-encre/40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
" hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
           "border border-matrice-encre bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit",
        destructive:
          "border border-matrice-error bg-matrice-error text-white shadow-sm hover:bg-matrice-error/90",
        outline:
          "border border-matrice-encre bg-transparent text-matrice-encre shadow-xs hover:bg-matrice-sable/55 active:shadow-none",
        secondary:
          "border border-matrice-sable bg-matrice-sable text-matrice-encre hover:bg-matrice-sable/75",
        ghost: "border border-transparent text-matrice-encre hover:bg-matrice-sable/45",
        link: "text-matrice-or-fonce underline underline-offset-4 hover:text-matrice-encre",
      },
      size: {
        // @replit changed sizes
        default: "min-h-11 px-4 py-2",
        sm: "min-h-11 rounded-md px-3 text-xs",
        lg: "min-h-12 rounded-md px-8",
        icon: "h-11 w-11",
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
