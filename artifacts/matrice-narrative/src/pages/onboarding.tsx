import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NextActionBanner, ProgressBar, StepCard, type OnboardingProgress } from "@/components/onboarding/OnboardingBits";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding", "progress"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/onboarding/progress`);
      if (!response.ok) throw new Error("ONBOARDING_FAILED");
      return response.json() as Promise<OnboardingProgress>;
    },
  });
  const skipStep = useMutation({
    mutationFn: (stepId: string) => apiFetch(`${BASE}/api/onboarding/skip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step_id: stepId }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["onboarding"] }),
  });

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Onboarding beta</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-matrice-encre">Démarrage guidé</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/70">
                Les premières actions qui transforment un compte vide en atelier prêt : projet, Lentille, export, mandat et notifications.
              </p>
            </div>
            {data?.next_action && (
              <Link href={data.next_action.url}>
                <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                  Reprendre
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/55">
              <span>Progression</span>
              <span>{data?.progress_percent ?? 0}%</span>
            </div>
            <ProgressBar value={data?.progress_percent ?? 0} />
          </div>
        </header>

        {data && <NextActionBanner progress={data} />}

        {isLoading ? (
          <div className="rounded-2xl border border-matrice-sable bg-white p-6 text-matrice-encre/65">Chargement...</div>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {data?.all_steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                completed={data.completed_steps.includes(step.id)}
                skipped={data.skipped_steps.includes(step.id)}
                active={data.current_step?.id === step.id}
                onSkip={() => skipStep.mutate(step.id)}
              />
            ))}
          </section>
        )}

        <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-matrice-terracotta" />
            <div>
              <h2 className="font-serif text-2xl text-matrice-encre">Beta testeurs</h2>
              <p className="mt-1 text-sm leading-6 text-matrice-encre/70">
                Le support est intégré partout. Si un testeur bloque, il peut ouvrir un ticket depuis /support et BraveHeart voit la demande dans /admin/support.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
