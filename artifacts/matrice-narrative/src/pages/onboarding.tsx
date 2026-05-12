import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BookOpen, CheckCircle2, Clapperboard, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userAuthHeaders } from "@/lib/userAuth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const FORMAT_OPTIONS = [
  { id: "roman", label: "Roman", icon: BookOpen },
  { id: "scenario", label: "Scenario", icon: Clapperboard },
  { id: "serie", label: "Serie", icon: Sparkles },
];

const GOAL_OPTIONS = ["Structurer une idee", "Ecrire des scenes", "Preparer un pitch", "Construire une bible"];
const RHYTHM_OPTIONS = ["Exploration lente", "Sprint createur", "Production intensive"];

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState("roman");
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [rhythm, setRhythm] = useState(RHYTHM_OPTIONS[0]);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function complete() {
    setStatus("submitting");
    const response = await fetch(`${BASE}/api/auth/onboarding/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...userAuthHeaders(),
      },
      body: JSON.stringify({ format, goal, rhythm }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "ONBOARDING_FAILED");
      setStatus("error");
      return;
    }

    navigate(`${BASE}/projects/new`);
  }

  return (
    <div className="min-h-[100dvh] bg-[#09090e] text-white">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href={`${BASE}/`} className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
            <Sparkles className="h-4 w-4" />
          </span>
          Matrice Narrative
        </Link>
        <span className="text-sm text-white/40">Etape {step}/3</span>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="mb-10 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className={`h-1.5 rounded-full ${item <= step ? "bg-violet-400" : "bg-white/10"}`} />
          ))}
        </div>

        <section className="rounded-3xl border border-white/[0.08] bg-[#10101a] p-6 shadow-2xl shadow-black/35 sm:p-9">
          {step === 1 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Format</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Quel type de projet veux-tu construire ?</h1>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {FORMAT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormat(option.id)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      format === option.id ? "border-violet-300/55 bg-violet-500/12" : "border-white/[0.08] bg-white/[0.03]"
                    }`}
                  >
                    <option.icon className="h-6 w-6 text-violet-200" />
                    <span className="mt-5 block font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Objectif</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Quelle premiere victoire veux-tu obtenir ?</h1>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGoal(option)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      goal === option ? "border-violet-300/55 bg-violet-500/12" : "border-white/[0.08] bg-white/[0.03]"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Rythme</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Choisis ton mode de travail.</h1>
              <div className="mt-8 grid gap-3">
                {RHYTHM_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRhythm(option)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      rhythm === option ? "border-violet-300/55 bg-violet-500/12" : "border-white/[0.08] bg-white/[0.03]"
                    }`}
                  >
                    <PenLine className="h-4 w-4 text-violet-200" />
                    {option}
                  </button>
                ))}
              </div>
              {status === "error" && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
                  {message}
                </div>
              )}
            </div>
          )}

          <div className="mt-10 flex justify-between gap-3">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
              Retour
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((current) => current + 1)} className="bg-violet-500 text-white hover:bg-violet-400">
                Continuer
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={complete} disabled={status === "submitting"} className="bg-violet-500 text-white hover:bg-violet-400">
                {status === "submitting" ? "Finalisation..." : "Creer mon premier projet"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
