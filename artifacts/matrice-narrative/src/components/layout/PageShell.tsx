import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  variant?: "vitrine" | "travail";
  className?: string;
  children: ReactNode;
};

export function PageShell({ variant = "travail", className, children }: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen font-sans",
        variant === "vitrine"
          ? "bg-essuf-noir text-essuf-blanc-voile"
          : "matrice-work bg-matrice-ivoire text-matrice-encre",
        className
      )}
    >
      {children}
    </div>
  );
}
