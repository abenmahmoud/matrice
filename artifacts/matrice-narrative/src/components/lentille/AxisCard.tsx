import { Aperture, Minimize2, Shuffle, Smartphone, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LentilleScores } from "./types";

type AxisKey = Exclude<keyof LentilleScores, "global">;

const AXIS_META: Record<AxisKey, { label: string; icon: LucideIcon; accent: string; description: string }> = {
  microdrama: {
    label: "Microdrama",
    icon: Smartphone,
    accent: "text-matrice-terracotta",
    description: "Hook court, rythme vertical, cliffhangers.",
  },
  ai_prod: {
    label: "IA & prévisualisation",
    icon: Sparkles,
    accent: "text-matrice-or-fonce",
    description: "Images fortes, décors lisibles, production assistée.",
  },
  pression_spatiale: {
    label: "Pression spatiale",
    icon: Minimize2,
    accent: "text-matrice-bleu-nuit",
    description: "Tension condensée, lieux maîtrisés, coût contenu.",
  },
  perso_deplace: {
    label: "Personnage déplacé",
    icon: UserRound,
    accent: "text-matrice-terracotta",
    description: "Découverte organique d'un monde hostile ou codé.",
  },
  hybridation: {
    label: "Hybridation",
    icon: Shuffle,
    accent: "text-matrice-or-fonce",
    description: "Genre populaire au service d'un thème profond.",
  },
};

export function AxisCard({ axe, score }: { axe: AxisKey; score: number }) {
  const meta = AXIS_META[axe];
  const Icon = meta.icon ?? Aperture;

  return (
    <div className="rounded-lg border border-matrice-sable bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-matrice-sable/38", meta.accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-serif text-3xl font-bold text-matrice-encre">{score}</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-matrice-encre">{meta.label}</h3>
      <p className="mt-1 min-h-[3rem] text-xs leading-relaxed text-matrice-encre/58">{meta.description}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-matrice-sable/55">
        <div className="h-full rounded-full bg-matrice-terracotta transition-all duration-700" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
