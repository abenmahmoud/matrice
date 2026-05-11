import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setUserToken } from "@/lib/userAuth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LoginState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; canResend?: boolean; email?: string };

function loginErrorLabel(error?: string): string {
  if (error === "EMAIL_NOT_VERIFIED") return "Ton email doit etre confirme avant la connexion.";
  if (error === "INVALID_CREDENTIALS") return "Email ou mot de passe incorrect.";
  if (error === "EMAIL_AND_PASSWORD_REQUIRED") return "Email et mot de passe requis.";
  return "Connexion impossible pour le moment.";
}

function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const next = useMemo(() => safeNext(new URLSearchParams(window.location.search).get("next")), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const response = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      canResend?: boolean;
    };

    if (!response.ok || !payload.token) {
      setState({
        status: "error",
        message: loginErrorLabel(payload.error),
        canResend: payload.canResend,
        email,
      });
      return;
    }

    setUserToken(payload.token);
    navigate(next);
  }

  async function resendVerification() {
    const resendEmail = state.status === "error" ? state.email : email;
    if (!resendEmail) return;
    setState({ status: "submitting" });
    await fetch(`${BASE}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resendEmail }),
    }).catch(() => null);
    setState({
      status: "error",
      message: "Si ce compte existe, un nouveau lien de confirmation a ete prepare.",
      email: resendEmail,
    });
  }

  return (
    <div className="min-h-[100dvh] bg-[#09090e] text-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href={`${BASE}/`} className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
            <Sparkles className="h-4 w-4" />
          </span>
          Matrice Narrative
        </Link>
        <Link href={`${BASE}/signup`} className="hidden items-center gap-2 text-sm text-white/55 transition hover:text-white sm:flex">
          Creer un compte
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
        <section>
          <Link href={`${BASE}/`} className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Connexion</p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            Reprends ton espace createur.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/58">
            Connecte-toi pour retrouver tes projets, continuer tes generations et acceder aux modules ouverts par ton plan.
          </p>
          <div className="mt-8 flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-6 text-white/52">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            Les projets sont separes par compte et les limites sont appliquees cote serveur.
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#10101a] p-5 shadow-2xl shadow-black/35 sm:p-7">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold">Se connecter</h2>
              <p className="mt-2 text-sm text-white/50">Entre ton email et ton mot de passe Matrice.</p>
            </div>

            <label className="block text-sm text-white/70">
              Email
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 border-white/[0.12] bg-black/25 text-white"
                placeholder="toi@email.com"
              />
            </label>
            <label className="block text-sm text-white/70">
              Mot de passe
              <Input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 border-white/[0.12] bg-black/25 text-white"
                placeholder="Ton mot de passe"
              />
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <Link href={`${BASE}/forgot-password`} className="text-white/45 transition hover:text-white">
                Mot de passe oublie ?
              </Link>
              <Link href={`${BASE}/signup`} className="text-violet-200/75 transition hover:text-violet-100">
                Creer un compte
              </Link>
            </div>

            {state.status === "error" && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
                <p>{state.message}</p>
                {state.canResend && (
                  <button type="button" onClick={resendVerification} className="mt-2 text-violet-100 underline underline-offset-4">
                    Renvoyer le lien de confirmation
                  </button>
                )}
              </div>
            )}

            <Button type="submit" disabled={state.status === "submitting"} className="h-11 w-full bg-violet-500 text-white hover:bg-violet-400">
              {state.status === "submitting" ? "Connexion..." : "Se connecter"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
