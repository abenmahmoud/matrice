import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Circle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  order: number;
  required: boolean;
};

export type OnboardingProgress = {
  current_step: OnboardingStep | null;
  completed_steps: string[];
  skipped_steps: string[];
  progress_percent: number;
  required_completed: boolean;
  next_action: { url: string; label: string } | null;
  all_steps: OnboardingStep[];
};

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-matrice-sable">
      <div className="h-full rounded-full bg-matrice-encre transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function StepCard({ step, completed, skipped, active, onSkip }: { step: OnboardingStep; completed: boolean; skipped: boolean; active: boolean; onSkip?: () => void }) {
  return (
    <article className={cn("rounded-2xl border bg-white p-5 shadow-sm", active ? "border-matrice-terracotta/45" : "border-matrice-sable")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl", completed ? "bg-matrice-success text-white" : skipped ? "bg-matrice-sable text-matrice-encre/55" : "bg-matrice-terracotta/12 text-matrice-terracotta")}>
            {completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/50">Etape {step.order}{step.required ? " · requise" : ""}</p>
            <h2 className="mt-1 font-serif text-2xl text-matrice-encre">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-matrice-encre/70">{step.description}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={step.cta_url}>
          <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
            {completed ? "Revoir" : step.cta_label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        {!step.required && !completed && !skipped && onSkip && (
          <Button variant="outline" className="rounded-xl" onClick={onSkip}>
            <SkipForward className="h-4 w-4" />
            Passer
          </Button>
        )}
      </div>
    </article>
  );
}

export function NextActionBanner({ progress }: { progress?: OnboardingProgress }) {
  if (!progress || progress.required_completed || !progress.next_action || !progress.current_step) return null;
  return (
    <section className="rounded-2xl border border-matrice-terracotta/25 bg-matrice-terracotta/10 p-4 text-matrice-encre shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Prochaine etape</p>
          <p className="mt-1 font-serif text-xl">{progress.current_step.title}</p>
          <p className="mt-1 text-sm text-matrice-encre/70">{progress.current_step.description}</p>
        </div>
        <Link href={progress.next_action.url}>
          <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
            {progress.next_action.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
