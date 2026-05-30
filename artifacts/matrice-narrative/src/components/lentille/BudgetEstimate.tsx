import type { LentilleBudgetEstimate } from "./types";

const TIERS: Array<LentilleBudgetEstimate["tier"]> = ["micro", "low", "medium", "high"];
const LABELS: Record<LentilleBudgetEstimate["tier"], string> = {
  micro: "Micro",
  low: "Low",
  medium: "Medium",
  high: "High",
};

function eur(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function BudgetEstimate({ estimate }: { estimate: LentilleBudgetEstimate }) {
  const index = Math.max(0, TIERS.indexOf(estimate.tier));
  const [min, max] = estimate.total_eur_range;

  return (
    <div className="rounded-lg border border-matrice-sable bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Budget production</p>
          <p className="mt-1 font-serif text-2xl font-bold text-matrice-encre">{LABELS[estimate.tier]}</p>
        </div>
        <p className="text-sm font-semibold text-matrice-encre/70">
          {eur(min)} - {eur(max)}
        </p>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {TIERS.map((tier, tierIndex) => (
          <div key={tier} className="space-y-2">
            <div className={tierIndex <= index ? "h-2 rounded-full bg-matrice-terracotta" : "h-2 rounded-full bg-matrice-sable"} />
            <p className="text-center text-[10px] uppercase tracking-[0.12em] text-matrice-encre/45">{LABELS[tier]}</p>
          </div>
        ))}
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-matrice-encre">Décors</dt>
          <dd className="mt-1 text-matrice-encre/60">{estimate.breakdown.decors || "Non précisé"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-matrice-encre">Personnages</dt>
          <dd className="mt-1 text-matrice-encre/60">{estimate.breakdown.personnages || "Non précisé"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-matrice-encre">Tournage</dt>
          <dd className="mt-1 text-matrice-encre/60">{estimate.breakdown.jours_tournage || "Non précisé"}</dd>
        </div>
      </dl>
    </div>
  );
}
