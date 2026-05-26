import { Link } from "wouter";
import { ArrowRight, Clock3 } from "lucide-react";
import type { LentilleHistoryItem } from "./types";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function LentilleHistory({ analyses }: { analyses: LentilleHistoryItem[] }) {
  if (analyses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-matrice-sable bg-white/58 p-5 text-sm text-matrice-encre/55">
        Aucun audit Lentille Marché pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <Link key={analysis.id} href={`/lentille-marche/${analysis.id}`}>
          <article className="flex cursor-pointer flex-col gap-3 rounded-lg border border-matrice-sable bg-white p-4 transition hover:border-matrice-or-fonce/45 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-matrice-encre/45">
                <Clock3 className="h-4 w-4" />
                {formatDate(analysis.createdAt)}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-matrice-encre">{analysis.inputLogline}</p>
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="font-serif text-2xl font-bold text-matrice-terracotta">{analysis.scoreGlobal}</span>
              <ArrowRight className="h-4 w-4 text-matrice-encre/35" />
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
