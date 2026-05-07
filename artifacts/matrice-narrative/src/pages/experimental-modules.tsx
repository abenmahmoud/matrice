import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, FlaskConical, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ExperimentalModule = {
  id: string;
  slug: string;
  name: string;
  description: string;
  minimumPlan: string;
  isOwnerOnly: boolean;
  isEnabled: boolean;
  available: boolean;
};

export default function ExperimentalModulesPage() {
  const { data, isLoading } = useQuery<{ modules: ExperimentalModule[] }>({
    queryKey: ["/api/experimental-modules"],
    queryFn: () => apiFetch(`${BASE}/api/experimental-modules`).then((response) => response.json()),
  });
  const modules = data?.modules ?? [];

  return (
    <div className="min-h-[100dvh] bg-[#09090e] px-5 py-10 text-white sm:px-8">
      <main className="mx-auto max-w-6xl">
        <Link href={`${BASE}/dashboard`} className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Lab experimental</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Modules actives par plan.</h1>
            <p className="mt-5 text-sm leading-7 text-white/55">
              Cette page expose ce qui peut etre active pour Studio, Enterprise ou owner. Les modules owner-only
              restent invisibles a l'usage public meme quand la table existe.
            </p>
            <Button asChild className="mt-7 bg-violet-500 text-white hover:bg-violet-400">
              <Link href={`${BASE}/pricing`}>Voir les paliers</Link>
            </Button>
          </section>

          <section className="grid gap-4">
            {isLoading && <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-white/55">Chargement...</div>}
            {!isLoading && modules.length === 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <FlaskConical className="h-7 w-7 text-violet-200" />
                <h2 className="mt-5 text-xl font-semibold">Aucun module configure</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">L'owner pourra ajouter les modules experimentaux apres migration VPS.</p>
              </div>
            )}
            {modules.map((module) => (
              <article key={module.id} className="rounded-2xl border border-white/[0.08] bg-[#10101a] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{module.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">{module.description || module.slug}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${module.available ? "bg-emerald-400/15 text-emerald-200" : "bg-white/[0.06] text-white/45"}`}>
                    {module.available ? "Disponible" : "Verrouille"}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
                  <span className="rounded-full bg-white/[0.05] px-3 py-1">Plan minimum: {module.minimumPlan}</span>
                  {module.isOwnerOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/10 px-3 py-1 text-violet-200">
                      <LockKeyhole className="h-3 w-3" />
                      Owner only
                    </span>
                  )}
                  {!module.isEnabled && <span className="rounded-full bg-red-400/10 px-3 py-1 text-red-100">Desactive</span>}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
