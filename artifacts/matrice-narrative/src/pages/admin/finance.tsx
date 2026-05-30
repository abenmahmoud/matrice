import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowDownToLine,
  CalendarDays,
  Euro,
  ExternalLink,
  Percent,
  RefreshCw,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Overview = {
  mrr_eur: string;
  active_subscriptions: number;
  ca_month_eur: string;
  commissions_eur: string;
};

type SubscriptionRow = {
  subscription_id: string;
  customer_email: string | null;
  customer_name: string | null;
  plan: string;
  amount_eur: string;
  interval: string | null;
  created: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

type TransactionRow = {
  id: string;
  date: string;
  customer_email: string | null;
  amount_eur: string;
  currency: string;
  description: string | null;
  receipt_url: string | null;
  paid: boolean;
};

type VatReport = {
  period: { year: number; quarter: number; from: string; to: string };
  ca_ttc_eur: string;
  ca_ht_eur: string;
  tva_collectee_eur: string;
  nb_transactions: number;
};

type TabKey = "subscriptions" | "transactions" | "vat";

const today = new Date();
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function fetchJson<T>(url: string, headers: HeadersInit): Promise<T> {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? `Erreur HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function formatDate(value: string | null): string {
  if (!value) return "Non disponible";
  return new Date(value).toLocaleDateString("fr-FR");
}

function euro(value: string): string {
  return `${value} EUR`;
}

export default function AdminFinancePage() {
  const { isLoggedIn, adminHeaders } = useAdmin();
  const [tab, setTab] = useState<TabKey>("subscriptions");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [vatReport, setVatReport] = useState<VatReport | null>(null);
  const [from, setFrom] = useState(dateInputValue(thirtyDaysAgo));
  const [to, setTo] = useState(dateInputValue(today));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [quarter, setQuarter] = useState(String(Math.ceil((today.getMonth() + 1) / 3)));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(() => adminHeaders(), [adminHeaders]);

  async function loadAll() {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    try {
      const [overviewPayload, subscriptionsPayload, transactionsPayload] = await Promise.all([
        fetchJson<Overview>(`${BASE}/api/admin/finance/overview`, headers),
        fetchJson<{ subscriptions: SubscriptionRow[] }>(`${BASE}/api/admin/finance/subscriptions`, headers),
        fetchJson<{ transactions: TransactionRow[] }>(
          `${BASE}/api/admin/finance/transactions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          headers
        ),
      ]);
      setOverview(overviewPayload);
      setSubscriptions(subscriptionsPayload.subscriptions);
      setTransactions(transactionsPayload.transactions);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions() {
    setBusy(true);
    setError("");
    try {
      const payload = await fetchJson<{ transactions: TransactionRow[] }>(
        `${BASE}/api/admin/finance/transactions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        headers
      );
      setTransactions(payload.transactions);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function loadVatReport() {
    setBusy(true);
    setError("");
    try {
      const payload = await fetchJson<VatReport>(
        `${BASE}/api/admin/finance/vat-report?year=${encodeURIComponent(year)}&quarter=${encodeURIComponent(quarter)}`,
        headers
      );
      setVatReport(payload);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadCsv() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `${BASE}/api/admin/finance/export/csv?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { headers }
      );
      if (!response.ok) throw new Error(`Export impossible (${response.status})`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `matrice-finance-${from}-${to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [isLoggedIn]);

  const transactionTotal = transactions.reduce((sum, row) => sum + Number(row.amount_eur), 0).toFixed(2);

  if (!isLoggedIn) {
    return (
      <PageShell variant="travail" className="flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-matrice-sable bg-white p-8 text-center shadow-xl shadow-black/10">
          <h1 className="font-serif text-2xl font-semibold">Acces admin requis</h1>
          <p className="mt-3 text-sm text-matrice-encre/60">Connectez-vous au Studio pour ouvrir le suivi comptable.</p>
          <Button asChild className="mt-6 bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
            <Link href="/admin">Connexion admin</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="travail">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Admin</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-matrice-encre">Suivi comptable</h1>
            <p className="mt-2 text-sm text-matrice-encre/60">Vue d'ensemble financiere Essuf-Group SAS.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/authors">Auteurs</Link>
            </Button>
            <Button onClick={() => void loadAll()} disabled={loading} className="bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Actualiser
            </Button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-matrice-error/20 bg-matrice-error/10 px-4 py-3 text-sm text-matrice-error">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="MRR" value={overview ? euro(overview.mrr_eur) : "..."} icon={TrendingUp} />
          <KpiCard label="Abonnes actifs" value={String(overview?.active_subscriptions ?? "...")} icon={Users} />
          <KpiCard label="CA du mois" value={overview ? euro(overview.ca_month_eur) : "..."} icon={Euro} />
          <KpiCard label="Commissions" value={overview ? euro(overview.commissions_eur) : "..."} icon={Percent} />
        </div>

        <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-matrice-sable bg-white p-1.5 shadow-sm">
          <TabButton active={tab === "subscriptions"} onClick={() => setTab("subscriptions")}>Abonnements</TabButton>
          <TabButton active={tab === "transactions"} onClick={() => setTab("transactions")}>Transactions</TabButton>
          <TabButton active={tab === "vat"} onClick={() => setTab("vat")}>TVA & exports</TabButton>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-matrice-sable bg-white p-10 text-center text-matrice-encre/55">
            Chargement des donnees Stripe...
          </div>
        ) : (
          <>
            {tab === "subscriptions" && <SubscriptionsTable rows={subscriptions} />}
            {tab === "transactions" && (
              <TransactionsTable
                rows={transactions}
                from={from}
                to={to}
                total={transactionTotal}
                busy={busy}
                onFrom={setFrom}
                onTo={setTo}
                onRefresh={() => void loadTransactions()}
              />
            )}
            {tab === "vat" && (
              <VatExportPanel
                year={year}
                quarter={quarter}
                report={vatReport}
                busy={busy}
                onYear={setYear}
                onQuarter={setQuarter}
                onReport={() => void loadVatReport()}
                onCsv={() => void downloadCsv()}
              />
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

function KpiCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-encre/45">{label}</span>
        <Icon className="h-5 w-5 text-matrice-or-fonce" />
      </div>
      <p className="mt-4 text-3xl font-semibold text-matrice-encre">{value}</p>
    </section>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] rounded-xl px-4 text-sm font-medium transition",
        active ? "bg-matrice-terracotta text-white shadow-sm" : "text-matrice-encre/60 hover:bg-matrice-sable/45 hover:text-matrice-encre"
      )}
    >
      {children}
    </button>
  );
}

function SubscriptionsTable({ rows }: { rows: SubscriptionRow[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
      <div className="border-b border-matrice-sable px-5 py-4">
        <h2 className="font-serif text-xl font-semibold">Abonnements actifs</h2>
      </div>
      <div className="divide-y divide-matrice-sable md:hidden">
        {rows.map((row) => (
          <article key={row.subscription_id} className="space-y-3 p-5">
            <div>
              <p className="font-medium">{row.customer_name || "Client Stripe"}</p>
              <p className="mobile-safe-wrap text-sm text-matrice-encre/55">{row.customer_email || row.subscription_id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <SmallDatum label="Plan" value={row.plan} />
              <SmallDatum label="Montant" value={`${euro(row.amount_eur)} / ${row.interval === "year" ? "an" : "mois"}`} />
              <SmallDatum label="Renouvellement" value={formatDate(row.current_period_end)} />
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-matrice-encre/42">Statut</p>
                {row.cancel_at_period_end ? (
                  <span className="mt-1 inline-flex rounded-full bg-matrice-warning/15 px-3 py-1 text-xs font-medium text-matrice-warning">Annulera</span>
                ) : (
                  <span className="mt-1 inline-flex rounded-full bg-matrice-success/15 px-3 py-1 text-xs font-medium text-matrice-success">Actif</span>
                )}
              </div>
            </div>
          </article>
        ))}
        {rows.length === 0 && <div className="p-8 text-center text-matrice-encre/50">Aucun abonnement actif.</div>}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-matrice-ivoire text-xs uppercase tracking-[0.14em] text-matrice-encre/45">
            <tr>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Montant</th>
              <th className="px-5 py-3">Renouvellement</th>
              <th className="px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-matrice-sable">
            {rows.map((row) => (
              <tr key={row.subscription_id}>
                <td className="px-5 py-4">
                  <div className="font-medium">{row.customer_name || "Client Stripe"}</div>
                  <div className="text-xs text-matrice-encre/50">{row.customer_email || row.subscription_id}</div>
                </td>
                <td className="px-5 py-4">{row.plan}</td>
                <td className="px-5 py-4">{euro(row.amount_eur)} / {row.interval === "year" ? "an" : "mois"}</td>
                <td className="px-5 py-4">{formatDate(row.current_period_end)}</td>
                <td className="px-5 py-4">
                  {row.cancel_at_period_end ? (
                    <span className="rounded-full bg-matrice-warning/15 px-3 py-1 text-xs font-medium text-matrice-warning">Annulera</span>
                  ) : (
                    <span className="rounded-full bg-matrice-success/15 px-3 py-1 text-xs font-medium text-matrice-success">Actif</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-matrice-encre/50" colSpan={5}>Aucun abonnement actif.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TransactionsTable(props: {
  rows: TransactionRow[];
  from: string;
  to: string;
  total: string;
  busy: boolean;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-matrice-sable px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">Transactions</h2>
          <p className="mt-1 text-sm text-matrice-encre/55">Total periode : {euro(props.total)}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <DateField label="Du" value={props.from} onChange={props.onFrom} />
          <DateField label="Au" value={props.to} onChange={props.onTo} />
          <Button onClick={props.onRefresh} disabled={props.busy} variant="outline">
            <CalendarDays className="h-4 w-4" />
            Filtrer
          </Button>
        </div>
      </div>
      <div className="divide-y divide-matrice-sable md:hidden">
        {props.rows.map((row) => (
          <article key={row.id} className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{formatDate(row.date)}</p>
                <p className="mobile-safe-wrap text-sm text-matrice-encre/55">{row.customer_email || "Non renseigne"}</p>
              </div>
              <span className="shrink-0 rounded-full bg-matrice-sable/60 px-3 py-1 text-sm font-semibold">
                {euro(row.amount_eur)}
              </span>
            </div>
            <p className="mobile-safe-wrap text-sm text-matrice-encre/65">{row.description || row.id}</p>
            {row.receipt_url && (
              <a className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-matrice-or-fonce hover:underline" href={row.receipt_url} target="_blank" rel="noreferrer">
                Ouvrir le recu <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </article>
        ))}
        {props.rows.length === 0 && <div className="p-8 text-center text-matrice-encre/50">Aucune transaction sur cette periode.</div>}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-matrice-ivoire text-xs uppercase tracking-[0.14em] text-matrice-encre/45">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Montant</th>
              <th className="px-5 py-3">Recu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-matrice-sable">
            {props.rows.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-4">{formatDate(row.date)}</td>
                <td className="px-5 py-4">{row.customer_email || "Non renseigne"}</td>
                <td className="px-5 py-4">{row.description || row.id}</td>
                <td className="px-5 py-4 font-medium">{euro(row.amount_eur)}</td>
                <td className="px-5 py-4">
                  {row.receipt_url ? (
                    <a className="inline-flex items-center gap-1 text-matrice-or-fonce hover:underline" href={row.receipt_url} target="_blank" rel="noreferrer">
                      Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : "Non disponible"}
                </td>
              </tr>
            ))}
            {props.rows.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-matrice-encre/50" colSpan={5}>Aucune transaction sur cette periode.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VatExportPanel(props: {
  year: string;
  quarter: string;
  report: VatReport | null;
  busy: boolean;
  onYear: (value: string) => void;
  onQuarter: (value: string) => void;
  onReport: () => void;
  onCsv: () => void;
}) {
  return (
    <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-serif text-xl font-semibold">TVA & exports</h2>
          <p className="mt-2 text-sm leading-6 text-matrice-encre/60">
            Rapport trimestriel base sur les paiements Stripe reussis. Export CSV compatible tableur avec separateur point-virgule.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-matrice-encre/70">
              Annee
              <input className="mt-2 h-11 w-full rounded-xl border border-matrice-sable bg-matrice-ivoire/60 px-3" value={props.year} onChange={(e) => props.onYear(e.target.value)} />
            </label>
            <label className="text-sm font-medium text-matrice-encre/70">
              Trimestre
              <select className="mt-2 h-11 w-full rounded-xl border border-matrice-sable bg-matrice-ivoire/60 px-3" value={props.quarter} onChange={(e) => props.onQuarter(e.target.value)}>
                <option value="1">T1</option>
                <option value="2">T2</option>
                <option value="3">T3</option>
                <option value="4">T4</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={props.onReport} disabled={props.busy} className="bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
              Generer rapport TVA
            </Button>
            <Button onClick={props.onCsv} disabled={props.busy} variant="outline">
              <ArrowDownToLine className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-matrice-sable bg-matrice-ivoire/60 p-5">
          {props.report ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric label="CA TTC" value={euro(props.report.ca_ttc_eur)} />
              <Metric label="CA HT" value={euro(props.report.ca_ht_eur)} />
              <Metric label="TVA collectee" value={euro(props.report.tva_collectee_eur)} />
              <Metric label="Transactions" value={String(props.report.nb_transactions)} />
            </div>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center text-center text-sm text-matrice-encre/55">
              Selectionnez une periode puis generez le rapport.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-matrice-encre/45">
      {label}
      <input
        type="date"
        className="mt-1 h-11 rounded-xl border border-matrice-sable bg-matrice-ivoire/60 px-3 text-sm text-matrice-encre"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SmallDatum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-matrice-encre/42">{label}</p>
      <p className="mobile-safe-wrap mt-1 font-medium text-matrice-encre">{value}</p>
    </div>
  );
}
