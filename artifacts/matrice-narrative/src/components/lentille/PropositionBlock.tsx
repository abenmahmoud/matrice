import { ArrowUpRight } from "lucide-react";
import type { LentilleProposition } from "./types";

export function PropositionBlock({ proposition }: { proposition: LentilleProposition }) {
  return (
    <article className="rounded-lg border border-matrice-sable bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">
        <ArrowUpRight className="h-4 w-4" />
        {proposition.axe || "axe"}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-matrice-encre">{proposition.proposition}</p>
      {proposition.impact && (
        <p className="mt-3 rounded-md bg-matrice-ivoire px-3 py-2 text-xs leading-relaxed text-matrice-encre/62">
          Impact : {proposition.impact}
        </p>
      )}
    </article>
  );
}
