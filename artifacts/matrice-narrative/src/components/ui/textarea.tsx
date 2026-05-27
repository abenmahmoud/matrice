import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-md border border-matrice-sable bg-white px-3 py-2 text-base text-matrice-encre shadow-sm placeholder:text-matrice-encre/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrice-or-fonce focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-matrice-sable disabled:text-matrice-encre/40 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
