import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, FlaskConical, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  studio: "Studio",
  premium: "Premium",
  pro: "Plan historique",
  publish: "Plan historique",
  enterprise: "Plan historique",
};

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
    <div className="matrice-work min-h-[100dvh] bg-matrice-ivoire px-5 py-10 text-matrice-encre sm:px-8">
      <main className="mx-auto max-w-6xl">
        <Link href={`${BASE}/dashboard`} className="inline-flex items-center gap-2 text-sm text-matrice-encre/55 transition hover:text-matrice-terracotta">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-matrice-or-fonce">Lab experimental</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Modules actives par plan.</h1>
            <p className="mt-5 text-sm leading-7 text-matrice-encre/62">
              Cette page expose ce qui peut etre active pour Studio ou Premium. Les modules reserves
              restent invisibles a l'usage public meme quand la table existe.
            </p>
            <Button asChild className="mt-7 bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
              <Link href={`${BASE}/pricing`}>Voir les paliers</Link>
            </Button>
          </section>

          <section className="grid gap-4">
            {isLoading && <div className="rounded-2xl border border-matrice-sable bg-white p-5 text-matrice-encre/62">Chargement...</div>}
            {!isLoading && modules.length === 0 && (
              <div className="rounded-2xl border border-matrice-sable bg-white p-6">
                <FlaskConical className="h-7 w-7 text-matrice-terracotta" />
                <h2 className="mt-5 text-xl font-semibold">Aucun module configure</h2>
                <p className="mt-2 text-sm leading-6 text-matrice-encre/55">Le Studio pourra ajouter les modules experimentaux apres migration VPS.</p>
              </div>
            )}
            {modules.map((module) => (
              <article key={module.id} className="rounded-2xl border border-matrice-sable bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{module.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-matrice-encre/55">{module.description || module.slug}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${module.available ? "bg-emerald-400/15 text-emerald-700" : "bg-matrice-sable/70 text-matrice-encre/55"}`}>
                    {module.available ? "Disponible" : "Verrouille"}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-matrice-encre/55">
                  <span className="rounded-full bg-matrice-sable/70 px-3 py-1">Plan minimum: {PLAN_LABELS[module.minimumPlan] ?? "Plan historique"}</span>
                  {module.isOwnerOnly && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-matrice-terracotta/10 px-3 py-1 text-matrice-terracotta">
                      <LockKeyhole className="h-3 w-3" />
                      Reserve Studio
                    </span>
                  )}
                  {!module.isEnabled && <span className="rounded-full bg-matrice-error/10 px-3 py-1 text-matrice-error">Desactive</span>}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
