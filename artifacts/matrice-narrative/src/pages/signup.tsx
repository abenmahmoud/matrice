import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SignupState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; email: string; delivery: string }
  | { status: "error"; message: string };

function deliveryLabel(delivery: unknown): string {
  if (!delivery || typeof delivery !== "object") return "Email prepare";
  const status = "status" in delivery ? String(delivery.status) : "";
  if (status === "sent") return "Email envoye";
  if (status === "skipped") return "Email non envoye en local";
  if (status === "failed") return "Email non envoye";
  return "Email prepare";
}

function signupErrorLabel(error: string | undefined): string {
  if (error === "INVALID_INVITE_CODE") return "Code d'invitation invalide.";
  if (error === "INVITE_CODE_EXHAUSTED") return "Ce code d'invitation a deja ete utilise.";
  if (error === "INVITE_CODE_EXPIRED") return "Ce code d'invitation a expire.";
  if (error === "EMAIL_ALREADY_EXISTS") return "Un compte existe deja avec cet email.";
  if (error === "EMAIL_AND_PASSWORD_REQUIRED") return "Email et mot de passe sont requis.";
  return error ?? "Creation impossible.";
}

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [state, setState] = useState<SignupState>({ status: "idle" });

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("invite");
    if (code) setInviteCode(code.trim().toUpperCase());
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const response = await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password, invite_code: inviteCode.trim() || undefined }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; emailDelivery?: unknown };

    if (!response.ok) {
      setState({ status: "error", message: signupErrorLabel(payload.error) });
      return;
    }

    setState({ status: "success", email, delivery: deliveryLabel(payload.emailDelivery) });
  }

  async function resend() {
    setState({ status: "submitting" });
    const response = await fetch(`${BASE}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; emailDelivery?: unknown };
    if (!response.ok) {
      setState({ status: "error", message: payload.error ?? "RESEND_FAILED" });
      return;
    }
    setState({ status: "success", email, delivery: deliveryLabel(payload.emailDelivery) });
  }

  return (
    <div className="min-h-[100dvh] bg-matrice-ivoire text-matrice-encre">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href={`${BASE}/`} className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-matrice-terracotta/12 text-matrice-terracotta">
            <Sparkles className="h-4 w-4" />
          </span>
          Matrice Narrative
        </Link>
        <Link href={`${BASE}/pricing`} className="hidden items-center gap-2 text-sm text-matrice-encre/62 transition hover:text-matrice-terracotta sm:flex">
          Voir les tarifs
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <section>
          <Link href={`${BASE}/`} className="inline-flex items-center gap-2 text-sm text-matrice-encre/52 transition hover:text-matrice-encre">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-matrice-or-fonce">Creation de compte</p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-normal text-matrice-encre sm:text-5xl">
            Active ton espace createur avec une verification email.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-matrice-encre/62">
            Le compte gratuit donne acces aux premieres fondations. Les modules avances restent verrouilles tant que
            l'abonnement n'est pas active.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-matrice-encre/70">
            {["Email confirme avant connexion", "Quotas Free controles cote serveur", "Studio et espace avance separes"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-matrice-success" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-2xl shadow-black/10 sm:p-7">
          {state.status === "success" ? (
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Confirme ton email</h2>
              <p className="mt-4 text-sm leading-7 text-matrice-encre/65">
                Un lien de verification a ete prepare pour <span className="text-matrice-encre">{state.email}</span>.
                Statut : <span className="text-matrice-or-fonce">{state.delivery}</span>.
              </p>
              <p className="mt-4 text-sm leading-7 text-matrice-encre/50">
                Tant que le domaine Resend n'est pas verifie, l'envoi reel dependra de l'expediteur configure sur le VPS.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={resend}>
                  Renvoyer le lien
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`${BASE}/verify-email`}>J'ai un lien</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold">Commencer</h2>
                <p className="mt-2 text-sm text-matrice-encre/55">Cree un compte Free, puis confirme ton email.</p>
              </div>
              <label className="block text-sm text-matrice-encre/72">
                Nom
                <Input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 border-matrice-sable bg-matrice-ivoire/60 text-matrice-encre"
                  placeholder="Ton nom ou pseudo"
                />
              </label>
              <label className="block text-sm text-matrice-encre/72">
                Email
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 border-matrice-sable bg-matrice-ivoire/60 text-matrice-encre"
                  placeholder="toi@email.com"
                />
              </label>
              <label className="block text-sm text-matrice-encre/72">
                Mot de passe
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 border-matrice-sable bg-matrice-ivoire/60 text-matrice-encre"
                  placeholder="8 caracteres minimum"
                />
              </label>
              <label className="block text-sm text-matrice-encre/72">
                Code d'invitation <span className="text-matrice-encre/50">(optionnel)</span>
                <Input
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  className="mt-2 border-matrice-sable bg-matrice-ivoire/60 text-matrice-encre"
                  placeholder="MATRICE-BETA-XXXXXX"
                  pattern="MATRICE-BETA-[A-HJ-NP-Z2-9]{6}"
                />
                {inviteCode && (
                  <span className="mt-2 block text-xs font-medium text-matrice-or-fonce">
                    Code beta detecte : plan premium offert selon invitation.
                  </span>
                )}
              </label>
              <Link href={`${BASE}/forgot-password`} className="block text-right text-sm text-matrice-encre/50 transition hover:text-matrice-terracotta">
                Mot de passe oublie ?
              </Link>

              {state.status === "error" && (
                <div className="rounded-xl border border-matrice-error/25 bg-matrice-error/10 p-3 text-sm text-matrice-error">
                  {state.message}
                </div>
              )}

              <Button type="submit" disabled={state.status === "submitting"} className="h-11 w-full">
                {state.status === "submitting" ? "Creation..." : "Creer mon compte"}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex gap-3 rounded-xl border border-matrice-sable bg-matrice-ivoire/60 p-4 text-sm leading-6 text-matrice-encre/58">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-matrice-success" />
                Le compte Free suffit pour demarrer. Les offres Studio, Premium et les recharges credits sont disponibles quand tu veux avancer plus loin.
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
