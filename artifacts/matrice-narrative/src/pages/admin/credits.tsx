import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Coins, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, PlanBadge, UserHealthBadge } from "@/components/admin/AdminBits";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AdminCreditUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  plan: string;
  status: string;
  isBetaTester: boolean;
  monthlyCredits: number;
  extraCredits: number;
  creditsRenewAt?: string | null;
  createdAt: string;
};

type UsersPayload = {
  users: AdminCreditUser[];
  pagination: { total: number; page: number; page_size: number; total_pages: number };
};

export default function AdminCreditsPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: "50", status: "all" });
    if (search.trim()) params.set("search", search.trim());
    if (plan !== "all") params.set("plan", plan);
    return params.toString();
  }, [page, plan, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/credits", queryString],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/users?${queryString}`);
      if (!response.ok) throw new Error("Credits utilisateurs inaccessibles");
      return response.json() as Promise<UsersPayload>;
    },
  });

  const totals = useMemo(() => {
    const users = data?.users ?? [];
    return users.reduce(
      (acc, user) => ({
        monthly: acc.monthly + user.monthlyCredits,
        extra: acc.extra + user.extraCredits,
        total: acc.total + user.monthlyCredits + user.extraCredits,
      }),
      { monthly: 0, extra: 0, total: 0 },
    );
  }, [data]);

  return (
    <AdminShell title="Credits" subtitle="Vue centrale des soldes utilisateurs. Les ajustements se font depuis la fiche utilisateur pour garder le contexte support.">
      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Credits visibles" value={totals.total} />
        <Stat label="Mensuels" value={totals.monthly} />
        <Stat label="Achetes" value={totals.extra} />
      </section>

      <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label className="relative block">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-matrice-encre/45" />
            <Input className="pl-10" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Email, nom, pseudo..." />
          </label>
          <select className="rounded-md border border-matrice-sable bg-white px-3 text-sm text-matrice-encre focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce" value={plan} onChange={(event) => { setPlan(event.target.value); setPage(1); }}>
            <option value="all">Tous les plans</option>
            <option value="free">Free</option>
            <option value="studio">Studio</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <AdminButton variant="secondary" onClick={() => { setSearch(""); setPlan("all"); setPage(1); }}>
            Reinitialiser
          </AdminButton>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-matrice-sable px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-matrice-encre">
            <Coins className="h-4 w-4 text-matrice-or-fonce" />
            {data?.pagination.total ?? 0} comptes
          </div>
          <span className="text-sm text-matrice-encre/65">Page {data?.pagination.page ?? page}/{data?.pagination.total_pages ?? 1}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-matrice-sable text-left text-xs uppercase tracking-[0.08em] text-matrice-encre">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Mensuels</th>
                <th className="px-4 py-3 text-right">Achetes</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Renouvellement</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="px-4 py-6 text-matrice-encre/65" colSpan={8}>Chargement...</td></tr>
              ) : data?.users.length ? data.users.map((user) => {
                const total = user.monthlyCredits + user.extraCredits;
                return (
                  <tr key={user.id} className="border-b border-matrice-sable/70 odd:bg-white even:bg-matrice-sable/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-matrice-encre">{user.displayName || "Sans nom"}</div>
                      <div className="mobile-safe-wrap text-matrice-encre/65">{user.email}</div>
                      <div className="mt-1 text-xs text-matrice-encre/50">{user.role}</div>
                    </td>
                    <td className="px-4 py-3"><PlanBadge plan={user.plan} /></td>
                    <td className="px-4 py-3"><UserHealthBadge status={user.status} beta={user.isBetaTester} /></td>
                    <td className="px-4 py-3 text-right font-medium text-matrice-encre">{user.monthlyCredits}</td>
                    <td className="px-4 py-3 text-right font-medium text-matrice-encre">{user.extraCredits}</td>
                    <td className="px-4 py-3 text-right text-lg font-semibold text-matrice-or-fonce">{total}</td>
                    <td className="px-4 py-3 text-matrice-encre/65">{user.creditsRenewAt ? new Date(user.creditsRenewAt).toLocaleDateString("fr-FR") : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link className="inline-flex min-h-[44px] items-center rounded-lg border border-matrice-encre px-3 text-sm font-medium text-matrice-encre hover:bg-matrice-sable/55" href={`/admin/users/${user.id}`}>
                        Ajuster
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td className="px-4 py-6 text-matrice-encre/65" colSpan={8}>Aucun utilisateur trouve.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <AdminButton variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Precedent</AdminButton>
          <AdminButton variant="secondary" disabled={!data || page >= data.pagination.total_pages} onClick={() => setPage((value) => value + 1)}>Suivant</AdminButton>
        </div>
      </section>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/55">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-matrice-or-fonce">{value}</p>
    </div>
  );
}

