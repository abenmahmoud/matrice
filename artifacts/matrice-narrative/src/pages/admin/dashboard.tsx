import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/admin/AdminBits";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type DashboardPayload = {
  users: { total: number; active: number; suspended: number; new_7d: number; new_30d: number; beta_testers: number; by_plan: Record<string, number> };
  projects: { total: number };
  lentille: { total: number; last_7d: number };
  exports: { total: number };
  mandates: { total: number; active: number };
  revenue: { mrr_eur: number; annual_estimate_eur: number };
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/dashboard`);
      if (!response.ok) throw new Error("Dashboard admin inaccessible");
      return response.json() as Promise<DashboardPayload>;
    },
  });

  return (
    <AdminShell title="Dashboard support" subtitle="Vue centrale pour suivre les utilisateurs, l'activite beta et les modules business.">
      {isLoading ? (
        <div className="rounded-2xl border border-matrice-sable bg-white p-8 text-matrice-encre/65">Chargement...</div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Utilisateurs" value={data.users.total} detail={`${data.users.active} actifs, ${data.users.suspended} suspendus`} />
            <KpiCard label="Nouveaux 7j" value={data.users.new_7d} detail={`${data.users.new_30d} sur 30 jours`} tone="good" />
            <KpiCard label="Beta testeurs" value={data.users.beta_testers} detail="Codes invitation et grants manuels" tone="warn" />
            <KpiCard label="MRR estime" value={`${data.revenue.mrr_eur} EUR`} detail={`${data.revenue.annual_estimate_eur} EUR annuel`} />
            <KpiCard label="Projets" value={data.projects.total} detail="Tous comptes confondus" />
            <KpiCard label="Lentille Marche" value={data.lentille.total} detail={`${data.lentille.last_7d} analyses sur 7j`} tone="good" />
            <KpiCard label="Exports" value={data.exports.total} detail="EPUB, DOCX, KDP PDF" />
            <KpiCard label="Mandats actifs" value={data.mandates.active} detail={`${data.mandates.total} mandats au total`} tone="warn" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-matrice-sable bg-white p-5">
              <h2 className="font-serif text-2xl text-matrice-encre">Plans actifs</h2>
              <div className="mt-4 space-y-3">
                {Object.entries(data.users.by_plan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between rounded-xl bg-matrice-ivoire px-4 py-3">
                    <span className="font-medium text-matrice-encre">{plan}</span>
                    <span className="text-matrice-encre/70">{count}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-matrice-sable bg-white p-5">
              <h2 className="font-serif text-2xl text-matrice-encre">Actions rapides</h2>
              <div className="mt-4 flex flex-col gap-3">
                <Link className="rounded-xl border border-matrice-sable px-4 py-3 text-matrice-encre hover:bg-matrice-sable/45" href="/admin/users">Ouvrir la liste utilisateurs</Link>
                <Link className="rounded-xl border border-matrice-sable px-4 py-3 text-matrice-encre hover:bg-matrice-sable/45" href="/admin/invites">Generer 10 codes beta</Link>
                <Link className="rounded-xl border border-matrice-sable px-4 py-3 text-matrice-encre hover:bg-matrice-sable/45" href="/admin/finance">Voir le suivi comptable</Link>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
