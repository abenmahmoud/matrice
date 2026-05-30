import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { type OnboardingProgress } from "@/components/onboarding/OnboardingBits";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function OnboardingStepPage() {
  const [, params] = useRoute("/onboarding/:stepId");
  const { data } = useQuery({
    queryKey: ["onboarding", "progress"],
    queryFn: async () => (await apiFetch(`${BASE}/api/onboarding/progress`)).json() as Promise<OnboardingProgress>,
  });
  const step = data?.all_steps.find((item) => item.id === params?.stepId) ?? data?.current_step;
  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Onboarding</p>
          <h1 className="mt-3 font-serif text-4xl text-matrice-encre">{step?.title ?? "Étape"}</h1>
          <p className="mt-3 text-sm leading-7 text-matrice-encre/70">{step?.description ?? "Cette étape aide à préparer ton espace de travail."}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {step && (
              <Link href={step.cta_url}>
                <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                  {step.cta_label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/onboarding">
              <Button variant="outline" className="rounded-xl">Retour</Button>
            </Link>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
