import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, CircleAlert, Server } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/admin/AdminBits";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SystemPayload = {
  server: { env: string; node_version: string; uptime_seconds: number; memory_mb: number };
  database: { total_users: number; total_projects: number };
  services: Record<string, boolean>;
};

export default function CreatorSystemPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/creator/system-info"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/creator/system-info`);
      if (!response.ok) throw new Error("Owner requis");
      return response.json() as Promise<SystemPayload>;
    },
  });

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/creator-lab" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-matrice-or-fonce hover:text-matrice-encre">
          <ArrowLeft className="h-4 w-4" />
          Retour au Creator Lab
        </Link>
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-matrice-bleu-nuit text-matrice-ivoire">
            <Server className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-4xl text-matrice-encre">System info</h1>
          <p className="mt-2 text-sm text-matrice-encre/70">Etat rapide des services relies a Matrice.</p>
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-matrice-sable bg-white p-8 text-matrice-encre/65">Chargement...</div>
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
              <h2 className="font-serif text-2xl text-matrice-encre">Services</h2>
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
      </main>
    </AppLayout>
  );
}
