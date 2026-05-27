import type * as React from "react";
import { cn } from "@/lib/utils";

export function KpiCard({ label, value, detail, tone = "neutral" }: { label: string; value: string | number; detail?: string; tone?: "neutral" | "good" | "warn" | "error" }) {
  const toneClass = {
    neutral: "text-matrice-bleu-nuit",
    good: "text-matrice-success",
    warn: "text-matrice-or-fonce",
    error: "text-matrice-error",
  }[tone];
  return (
    <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/55">{label}</p>
      <p className={cn("mt-3 text-3xl font-semibold", toneClass)}>{value}</p>
      {detail && <p className="mt-2 text-sm text-matrice-encre/65">{detail}</p>}
    </div>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const className = plan === "premium"
    ? "bg-essuf-or text-matrice-encre"
    : plan === "studio"
      ? "bg-matrice-bleu-nuit text-matrice-ivoire"
      : plan === "enterprise" || plan === "pro"
        ? "bg-matrice-bleu-nuit text-matrice-ivoire"
        : "bg-matrice-sable text-matrice-encre";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{plan}</span>;
}

export function UserHealthBadge({ status, beta }: { status: string; beta?: boolean }) {
  if (status === "suspended") return <span className="rounded-full bg-matrice-error px-2.5 py-1 text-xs font-semibold text-white">Suspendu</span>;
  if (status === "deleted") return <span className="rounded-full bg-matrice-sable px-2.5 py-1 text-xs font-semibold text-matrice-encre/55">Supprime</span>;
  if (beta) return <span className="rounded-full bg-essuf-or px-2.5 py-1 text-xs font-semibold text-matrice-encre">Beta tester</span>;
  return <span className="rounded-full bg-matrice-success px-2.5 py-1 text-xs font-semibold text-white">Actif</span>;
}

export function AdminButton({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const className = {
    primary: "bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit",
    secondary: "border border-matrice-sable bg-white text-matrice-encre hover:bg-matrice-sable/45",
    danger: "bg-matrice-error text-white hover:bg-matrice-error/90",
  }[variant];
  return (
    <button {...props} className={cn("inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-matrice-sable disabled:text-matrice-encre/40", className, props.className)}>
      {children}
    </button>
  );
}
