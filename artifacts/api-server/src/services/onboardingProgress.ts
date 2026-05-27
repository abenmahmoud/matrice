export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  order: number;
  required: boolean;
}

export type OnboardingProgressRow = { status: string; stepId: string };

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "welcome", title: "Bienvenue sur Matrice", description: "Quelques etapes rapides pour demarrer ta premiere oeuvre.", cta_label: "Commencer", cta_url: "/onboarding/welcome", order: 1, required: true },
  { id: "profile_complete", title: "Complete ton profil auteur", description: "Nom de plume, bio courte et preferences utiles.", cta_label: "Completer mon profil", cta_url: "/profile", order: 2, required: false },
  { id: "first_project", title: "Cree ton premier projet", description: "Roman, scenario, BD ou autre format : l'idee brute suffit.", cta_label: "Creer un projet", cta_url: "/projects/new", order: 3, required: true },
  { id: "first_lentille", title: "Lance ta premiere Lentille Marche", description: "Analyse le potentiel production de ton oeuvre.", cta_label: "Lancer la lentille", cta_url: "/lentille-marche", order: 4, required: false },
  { id: "first_export", title: "Exporte ton oeuvre", description: "Prepare un EPUB, DOCX ou PDF KDP.", cta_label: "Exporter", cta_url: "/locked-works", order: 5, required: false },
  { id: "first_mandate", title: "Cree ton mandat de representation", description: "Optionnel, pour confier la distribution a Essuf-Group.", cta_label: "Configurer un mandat", cta_url: "/dashboard", order: 6, required: false },
  { id: "notification_preferences", title: "Configure tes notifications", description: "Choisis quand Matrice te contacte.", cta_label: "Mes preferences", cta_url: "/profile/notifications", order: 7, required: false },
];

export function computeOnboardingProgress(progress: OnboardingProgressRow[]) {
  const completed = progress.filter((item) => item.status === "completed").map((item) => item.stepId);
  const skipped = progress.filter((item) => item.status === "skipped").map((item) => item.stepId);
  const visibleSteps = ONBOARDING_STEPS.filter((step) => !skipped.includes(step.id));
  const nextStep = visibleSteps
    .filter((step) => !completed.includes(step.id))
    .sort((a, b) => a.order - b.order)[0] ?? null;
  const requiredSteps = ONBOARDING_STEPS.filter((step) => step.required);
  const requiredDone = requiredSteps.every((step) => completed.includes(step.id) || skipped.includes(step.id));
  const denominator = Math.max(1, visibleSteps.length);
  return {
    current_step: nextStep,
    completed_steps: completed,
    skipped_steps: skipped,
    progress_percent: requiredDone ? 100 : Math.round((completed.length / denominator) * 100),
    required_completed: requiredDone,
    next_action: nextStep ? { url: nextStep.cta_url, label: nextStep.cta_label } : null,
  };
}
