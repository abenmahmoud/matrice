import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Loader2, MailWarning, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const USER_TOKEN_KEY = "matrice_user_token";

type VerifyState =
  | { status: "checking" }
  | { status: "success" }
  | { status: "error"; message: string };

export default function VerifyEmailPage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
  const [state, setState] = useState<VerifyState>(() => (token ? { status: "checking" } : { status: "error", message: "TOKEN_REQUIRED" }));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    async function verify() {
      const response = await fetch(`${BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      const payload = (await response.json().catch(() => ({}))) as { error?: string; token?: string };
      if (cancelled) return;

      if (!response.ok || !payload.token) {
        setState({ status: "error", message: payload.error ?? "VERIFY_FAILED" });
        return;
      }

      localStorage.setItem(USER_TOKEN_KEY, payload.token);
      setState({ status: "success" });
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#09090e] px-5 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#10101a] p-7 text-center shadow-2xl shadow-black/35">
        <Link href={`${BASE}/`} className="mx-auto mb-8 flex w-fit items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
            <Sparkles className="h-4 w-4" />
          </span>
          Matrice Narrative
        </Link>

        {state.status === "checking" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-violet-300" />
            <h1 className="mt-6 text-2xl font-semibold">Verification en cours</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">Nous validons ton lien de confirmation.</p>
          </>
        )}

        {state.status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-300" />
            <h1 className="mt-6 text-2xl font-semibold">Email confirme</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Ton compte est active. Tu peux commencer ton premier projet narratif.
            </p>
            <Button asChild className="mt-8 bg-violet-500 text-white hover:bg-violet-400">
              <Link href={`${BASE}/projects/new`}>
                Creer un projet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}

        {state.status === "error" && (
          <>
            <MailWarning className="mx-auto h-11 w-11 text-amber-300" />
            <h1 className="mt-6 text-2xl font-semibold">Lien invalide</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">{state.message}</p>
            <Button asChild className="mt-8 bg-white text-black hover:bg-white/90">
              <Link href={`${BASE}/signup`}>Retour signup</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
