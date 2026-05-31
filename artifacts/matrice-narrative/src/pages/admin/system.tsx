import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Server } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/admin/AdminBits";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SystemPayload = {
  server: { env: string; node_version: string; uptime_seconds: number; memory_mb: number };
  database: { total_users: number; total_projects: number };
  services: Record<string, boolean>;
};

export default function AdminSystemPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/creator/system-info", "admin-shell"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/creator/system-info`);
      if (!response.ok) throw new Error("Owner requis pour les infos systeme");
      return response.json() as Promise<SystemPayload>;
    },
  });

  return (
    <AdminShell title="Systeme" subtitle="Etat rapide des services relies a Matrice, affiche dans le cockpit admin unifie.">
      {isLoading ? (
        <div className="rounded-2xl border border-matrice-sable bg-white p-8 text-matrice-encre/65">Chargement...</div>
      ) : error instanceof Error ? (
        <div className="rounded-2xl border border-matrice-warning/35 bg-matrice-warning/10 p-5 text-matrice-encre">
          {error.message}
        </div>
      ) : data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Env" value={data.server.env} />
            <KpiCard label="Uptime" value={`${Math.floor(data.server.uptime_seconds / 60)} min`} />
            <KpiCard label="RAM" value={`${data.server.memory_mb} MB`} />
            <KpiCard label="Node" value={data.server.node_version.replace(/^v/, "")} />
            <KpiCard label="Users" value={data.database.total_users} />
            <KpiCard label="Projects" value={data.database.total_projects} />
          </section>

          <section className="rounded-2xl border border-matrice-sable bg-white p-5">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-matrice-or-fonce" />
              <h2 className="font-serif text-2xl text-matrice-encre">Services</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(data.services).map(([name, ok]) => (
                <div key={name} className="flex items-center justify-between rounded-xl border border-matrice-sable px-4 py-3">
                  <span className="text-sm font-medium text-matrice-encre">{name.replace(/_/g, " ")}</span>
                  {ok ? <CheckCircle2 className="h-5 w-5 text-matrice-success" /> : <CircleAlert className="h-5 w-5 text-matrice-warning" />}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}

