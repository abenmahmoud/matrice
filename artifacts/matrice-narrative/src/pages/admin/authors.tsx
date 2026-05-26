import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookMarked, Download, Euro, FileSignature, Search, Users, type LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AuthorRow = {
  id: string;
  email: string;
  display_name: string;
  role: string;
  plan: string;
  status: string;
  created_at: string;
  projects_count: number;
  locked_works_count: number;
  exports_count: number;
  mandate_signed: boolean;
  stripe_connect_status: string;
  payout_balance_eur: string;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
};

type AuthorsPayload = {
  authors: AuthorRow[];
  count: number;
  total: number;
};

async function fetchAuthors(headers: HeadersInit, query: string): Promise<AuthorsPayload> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  const response = await fetch(`${BASE}/api/admin/authors?${params.toString()}`, { headers });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? `Erreur HTTP ${response.status}`);
  }
  return response.json() as Promise<AuthorsPayload>;
}

function formatDate(value: string | null): string {
  if (!value) return "Non disponible";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default function AdminAuthorsPage() {
  const { isLoggedIn, adminHeaders } = useAdmin();
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const headers = useMemo(() => adminHeaders(), [adminHeaders]);

  async function loadAuthors() {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    try {
      const payload = await fetchAuthors(headers, query);
      setAuthors(payload.authors);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAuthors();
  }, [isLoggedIn]);

  const totals = authors.reduce(
    (acc, author) => ({
      projects: acc.projects + author.projects_count,
      locked: acc.locked + author.locked_works_count,
      exports: acc.exports + author.exports_count,
      balance: acc.balance + Number(author.payout_balance_eur),
    }),
    { projects: 0, locked: 0, exports: 0, balance: 0 }
  );

  if (!isLoggedIn) {
    return (
      <PageShell variant="travail" className="flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-matrice-sable bg-white p-8 text-center shadow-xl shadow-black/10">
          <h1 className="font-serif text-2xl font-semibold">Acces admin requis</h1>
          <p className="mt-3 text-sm text-matrice-encre/60">Connectez-vous au Studio pour consulter les auteurs.</p>
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
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/admin/finance" className="inline-flex items-center gap-2 text-sm text-matrice-encre/55 hover:text-matrice-terracotta">
              <ArrowLeft className="h-4 w-4" />
              Suivi comptable
            </Link>
            <h1 className="mt-4 font-serif text-3xl font-semibold text-matrice-encre">Auteurs</h1>
            <p className="mt-2 text-sm text-matrice-encre/60">Vue operationnelle des comptes, oeuvres verrouillees et futurs reversements.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void loadAuthors();
            }}
            className="flex w-full max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-matrice-encre/35" />
              <input
                className="h-11 w-full rounded-xl border border-matrice-sable bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-matrice-terracotta/30"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Email ou nom"
              />
            </div>
            <Button className="bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">Filtrer</Button>
          </form>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-matrice-error/20 bg-matrice-error/10 px-4 py-3 text-sm text-matrice-error">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Users} label="Auteurs affiches" value={String(authors.length)} />
          <Metric icon={BookMarked} label="Oeuvres verrouillees" value={String(totals.locked)} />
          <Metric icon={Download} label="Exports generes" value={String(totals.exports)} />
          <Metric icon={Euro} label="Solde a reverser" value={`${totals.balance.toFixed(2)} EUR`} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
          <div className="border-b border-matrice-sable px-5 py-4">
            <h2 className="font-serif text-xl font-semibold">Liste auteurs</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-sm text-matrice-encre/55">Chargement des auteurs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-matrice-ivoire text-xs uppercase tracking-[0.14em] text-matrice-encre/45">
                  <tr>
                    <th className="px-5 py-3">Auteur</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Oeuvres</th>
                    <th className="px-5 py-3">Exports</th>
                    <th className="px-5 py-3">Mandat</th>
                    <th className="px-5 py-3">Stripe Connect</th>
                    <th className="px-5 py-3">Solde</th>
                    <th className="px-5 py-3">Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matrice-sable">
                  {authors.map((author) => (
                    <tr key={author.id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-matrice-encre">{author.display_name || "Sans nom"}</div>
                        <div className="text-xs text-matrice-encre/50">{author.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-matrice-sable/60 px-3 py-1 text-xs font-semibold uppercase text-matrice-encre/70">
                          {author.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>{author.locked_works_count} verrouillee{author.locked_works_count > 1 ? "s" : ""}</div>
                        <div className="text-xs text-matrice-encre/45">{author.projects_count} projet{author.projects_count > 1 ? "s" : ""}</div>
                      </td>
                      <td className="px-5 py-4">{author.exports_count}</td>
                      <td className="px-5 py-4">
                        {author.mandate_signed ? (
                          <Status label="Signe" tone="success" />
                        ) : (
                          <Status label="Non signe" tone="neutral" icon={FileSignature} />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Status label={author.stripe_connect_status === "non_configure" ? "Non configure" : author.stripe_connect_status} tone="neutral" />
                      </td>
                      <td className="px-5 py-4 font-medium">{author.payout_balance_eur} EUR</td>
                      <td className="px-5 py-4">{formatDate(author.created_at)}</td>
                    </tr>
                  ))}
                  {authors.length === 0 && (
                    <tr>
                      <td className="px-5 py-8 text-center text-matrice-encre/50" colSpan={8}>Aucun auteur trouve.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-encre/45">{label}</p>
        <Icon className="h-5 w-5 text-matrice-or-fonce" />
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </section>
  );
}

function Status({ label, tone, icon: Icon }: { label: string; tone: "success" | "neutral"; icon?: LucideIcon }) {
  return (
    <span className={tone === "success"
      ? "inline-flex items-center gap-1 rounded-full bg-matrice-success/15 px-3 py-1 text-xs font-medium text-matrice-success"
      : "inline-flex items-center gap-1 rounded-full bg-matrice-sable/60 px-3 py-1 text-xs font-medium text-matrice-encre/58"}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
