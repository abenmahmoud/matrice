import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, BadgeEuro, Clock3, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SettlementStatus = "pending" | "paid" | "blocked_kyc";

type SaleEntry = {
  id: string;
  project_id: string;
  project_title: string;
  channel: string;
  date: string;
  gross_amount: number;
  currency: string;
  author_share: number;
  matrice_share: number;
  settlement_status: SettlementStatus;
  settlement_label: string;
};

type SalesMinePayload = {
  entries: SaleEntry[];
  totals: {
    gross_amount: number;
    author_share: number;
    matrice_share: number;
    paid_amount: number;
    pending_amount: number;
    blocked_kyc_amount: number;
    currency: string;
    author_percent: 90;
    matrice_percent: 10;
  };
};

export default function SalesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sales", "mine"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/sales/mine`);
      if (!response.ok) throw new Error("SALES_FAILED");
      return response.json() as Promise<SalesMinePayload>;
    },
  });

  const totals = data?.totals;
  const entries = data?.entries ?? [];
  const currency = totals?.currency ?? "EUR";

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Publication & revenus</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-matrice-encre">Mes ventes</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/70">
                Suis toutes les ventes de tes oeuvres, canal par canal, avec la repartition native 90% auteur / 10% Matrice.
              </p>
            </div>
            <Button asChild className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
              <Link href="/dashboard">
                Voir mes projets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <KpiCard icon={BadgeEuro} label="Revenu total" value={formatMoney(totals?.gross_amount ?? 0, currency)} />
          <KpiCard icon={TrendingUp} label="Ta part (90%)" value={formatMoney(totals?.author_share ?? 0, currency)} tone="good" />
          <KpiCard icon={Clock3} label="En attente de versement" value={formatMoney(totals?.pending_amount ?? 0, currency)} tone="warn" />
        </section>

        <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-matrice-or-fonce/12 text-matrice-or-fonce">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl text-matrice-encre">Tu publies sous ton nom</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-matrice-encre/70">
                Tu gardes 90% de chaque vente. Matrice ne preleve que 10% pour l'infrastructure, la preparation et le suivi.
                La paternite de l'oeuvre reste toujours a ton nom.
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
          <div className="border-b border-matrice-sable px-5 py-4">
            <h2 className="font-serif text-2xl text-matrice-encre">Historique des ventes</h2>
            <p className="mt-1 text-sm text-matrice-encre/60">Toutes oeuvres confondues, avec statut de reversement quand Stripe Connect est disponible.</p>
          </div>

          {isLoading ? (
            <p className="p-6 text-sm text-matrice-encre/60">Chargement des ventes...</p>
          ) : error ? (
            <p className="p-6 text-sm text-matrice-error">Impossible de charger tes ventes.</p>
          ) : entries.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-matrice-sable/45 text-xs uppercase tracking-[0.12em] text-matrice-encre/65">
                  <tr>
                    <th className="px-5 py-3">Oeuvre</th>
                    <th className="px-4 py-3">Canal</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                    <th className="px-4 py-3 text-right">Ta part (90%)</th>
                    <th className="px-5 py-3">Reversement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matrice-sable">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="transition hover:bg-matrice-sable/25">
                      <td className="px-5 py-4">
                        <Link href={`/projects/${entry.project_id}/publish`} className="font-semibold text-matrice-encre hover:text-matrice-or-fonce">
                          {entry.project_title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-matrice-encre/70">{entry.channel}</td>
                      <td className="px-4 py-4 text-matrice-encre/60">{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-4 text-right font-medium text-matrice-encre">{formatMoney(entry.gross_amount, entry.currency)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-matrice-success">{formatMoney(entry.author_share, entry.currency)}</td>
                      <td className="px-5 py-4">
                        <SettlementBadge status={entry.settlement_status} label={entry.settlement_label} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <WalletCards className="mx-auto h-10 w-10 text-matrice-or-fonce" />
              <h2 className="mt-4 font-serif text-2xl text-matrice-encre">Tes ventes apparaitront ici</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-matrice-encre/65">
                Des ta premiere publication et ta premiere vente, tu verras le canal, le montant brut, ta part auteur et le statut de reversement.
              </p>
              <Button asChild className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                <Link href="/dashboard">Preparer une publication</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}

function KpiCard({ icon: Icon, label, value, tone = "neutral" }: { icon: typeof BadgeEuro; label: string; value: string; tone?: "neutral" | "good" | "warn" }) {
  const color = tone === "good" ? "text-matrice-success" : tone === "warn" ? "text-matrice-warning" : "text-matrice-or-fonce";
  return (
    <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/55">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold text-matrice-encre">{value}</p>
    </div>
  );
}

function SettlementBadge({ status, label }: { status: SettlementStatus; label: string }) {
  const className = status === "paid"
    ? "bg-matrice-success text-white"
    : status === "blocked_kyc"
      ? "bg-matrice-error text-white"
      : "bg-matrice-warning text-matrice-encre";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}
