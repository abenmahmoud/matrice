import { cn } from "@/lib/utils";
import type { LentilleResult } from "./types";

const FORMAT_LABELS: Record<LentilleResult["format_recommendation"], string> = {
  film: "Film",
  serie: "Série",
  microdrama: "Microdrama",
  court: "Court",
  poc: "Preuve de concept",
  multiplateforme: "Multiplateforme",
};

const FORMAT_CLASSES: Record<LentilleResult["format_recommendation"], string> = {
  film: "bg-matrice-bleu-nuit text-white",
  serie: "bg-matrice-terracotta text-white",
  microdrama: "bg-matrice-or-fonce text-white",
  court: "bg-matrice-sable text-matrice-encre",
  poc: "bg-matrice-ivoire text-matrice-encre border border-matrice-sable",
  multiplateforme: "bg-gradient-to-r from-matrice-or-fonce to-matrice-terracotta text-white",
};

export function FormatRecommendation({
  format,
  reasoning,
}: {
  format: LentilleResult["format_recommendation"];
  reasoning: string;
}) {
  return (
    <div className="rounded-lg border border-matrice-sable bg-white p-5">
      <span className={cn("inline-flex min-h-[36px] items-center rounded-full px-4 text-sm font-semibold", FORMAT_CLASSES[format])}>
        {FORMAT_LABELS[format]}
      </span>
      <p className="mt-4 text-sm leading-relaxed text-matrice-encre/68">{reasoning}</p>
    </div>
  );
}
