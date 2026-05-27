import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, Eye, FlaskConical, Server, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminButton } from "@/components/admin/AdminBits";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Feature = {
  id: string;
  name: string;
  status: "experimental" | "planned" | "concept";
  description: string;
  readiness: number;
};

export default function CreatorLabPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/creator/lab/features"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/creator/lab/features`);
      if (!response.ok) throw new Error("Mode Createur requis");
      return response.json() as Promise<{ features: Feature[] }>;
    },
  });

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-essuf-or px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre">
            <Sparkles className="h-4 w-4" />
            Mode Createur
          </div>
          <h1 className="mt-4 font-serif text-4xl text-matrice-encre">Creator Lab</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-matrice-encre/70">
            Espace BraveHeart pour garder la main sur les modules experimentaux avant ouverture aux beta testeurs.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/creator-lab/system"><AdminButton variant="secondary"><Server className="h-4 w-4" /> Systeme</AdminButton></Link>
            <Link href="/creator-lab/preview"><AdminButton variant="secondary"><Eye className="h-4 w-4" /> Preview release</AdminButton></Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="rounded-2xl border border-matrice-sable bg-white p-6 text-matrice-encre/65">Chargement...</div>
          ) : data?.features.map((feature) => (
            <article key={feature.id} className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-matrice-sable px-2.5 py-1 text-xs font-semibold text-matrice-encre">{feature.status}</span>
              </div>
              <h2 className="mt-4 font-serif text-2xl text-matrice-encre">{feature.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-matrice-encre/70">{feature.description}</p>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-matrice-encre/55">
                  <span>Readiness</span>
                  <span>{Math.round(feature.readiness * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-matrice-sable">
                  <div className="h-full rounded-full bg-matrice-encre" style={{ width: `${Math.round(feature.readiness * 100)}%` }} />
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  );
}

export function CreatorPreviewPage() {
  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-essuf-or text-matrice-encre">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-4xl text-matrice-encre">Preview release</h1>
          <p className="mt-3 text-sm leading-7 text-matrice-encre/70">
            Cette zone sert a inspecter les modules avant de les rendre visibles aux beta testeurs. Les actions destructrices restent bloquees dans cette preview.
          </p>
          <Link href="/creator-lab" className="mt-6 inline-flex min-h-[44px] items-center rounded-lg border border-matrice-encre px-4 text-sm font-medium text-matrice-encre hover:bg-matrice-sable/55">
            Retour au Lab
          </Link>
        </section>
      </main>
    </AppLayout>
  );
}
