import type { ComponentType } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type SmartBackButtonProps = {
  fallback: string;
  label?: string;
  avoidPrefixes?: string[];
  className?: string;
  icon?: ComponentType<{ className?: string }>;
};

export function SmartBackButton({
  fallback,
  label = "Retour",
  avoidPrefixes = [],
  className,
  icon: Icon = ArrowLeft,
}: SmartBackButtonProps) {
  const [, navigate] = useLocation();

  function goBack() {
    const current = `${window.location.pathname}${window.location.search}`;
    const previous = window.sessionStorage.getItem("matrice_previous_path");
    const canUsePrevious =
      previous &&
      previous !== current &&
      !avoidPrefixes.some((prefix) => previous.startsWith(prefix));

    navigate(canUsePrevious ? previous : fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-sm font-medium text-matrice-or-fonce transition hover:bg-matrice-sable/45 hover:text-matrice-encre",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
