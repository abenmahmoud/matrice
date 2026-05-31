import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { setUserToken } from "@/lib/userAuth";

type LoginState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "unverified"; email: string; message: string; resendStatus?: "idle" | "sending" | "sent" | "error"; resendMessage?: string }
  | { status: "success" };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function deliveryLabel(delivery: unknown): string {
  if (!delivery || typeof delivery !== "object") return "Demande traitee.";
  const status = "status" in delivery ? String(delivery.status) : "";
  if (status === "sent") return "Email de confirmation envoye.";
  if (status === "skipped") return "Email non envoye : configuration email absente.";
  if (status === "failed") return "Email non envoye : expediteur ou cle email a verifier.";
  return "Demande traitee.";
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      next?: string;
      user?: { email?: string };
    };

    if (!response.ok) {
      if (payload.error === "EMAIL_NOT_VERIFIED") {
        setState({
          status: "unverified",
          email: payload.user?.email ?? normalizedEmail,
          message: "Ton compte n'est pas encore confirme. Verifie tes emails ou renvoie le lien de confirmation.",
          resendStatus: "idle",
        });
        return;
      }
      let message = "Identifiants invalides. Verifiez votre email et votre mot de passe.";
      if (payload.error === "ACCOUNT_LOCKED") {
        message = "Compte temporairement verrouille. Reessayez dans quelques minutes.";
      }
      setState({ status: "error", message });
      return;
    }

    if (!payload.token) {
      setState({ status: "error", message: "Connexion reussie, mais le jeton de session est manquant." });
      return;
    }

    setUserToken(payload.token);
    setState({ status: "success" });
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next") ?? payload.next ?? "/dashboard";
    setLocation(next);
  }

  async function resendVerification(targetEmail: string) {
    setState({
      status: "unverified",
      email: targetEmail,
      message: "Ton compte n'est pas encore confirme. Verifie tes emails ou renvoie le lien de confirmation.",
      resendStatus: "sending",
    });
    const response = await fetch(`${BASE}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; emailDelivery?: unknown };
    if (!response.ok) {
      const resendMessage = payload.error === "VERIFICATION_EMAIL_RECENTLY_SENT"
        ? "Un email vient deja d'etre envoye. Attends une minute avant de recommencer."
        : payload.error ?? "Impossible de renvoyer le lien pour le moment.";
      setState({
        status: "unverified",
        email: targetEmail,
        message: "Ton compte n'est pas encore confirme. Verifie tes emails ou renvoie le lien de confirmation.",
        resendStatus: "error",
        resendMessage,
      });
      return;
    }
    setState({
      status: "unverified",
      email: targetEmail,
      message: "Ton compte n'est pas encore confirme. Verifie tes emails ou renvoie le lien de confirmation.",
      resendStatus: "sent",
      resendMessage: deliveryLabel(payload.emailDelivery),
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-[0.2em] text-[#C9A961] mb-2">
            ESSUF - MATRICE
          </h1>
          <p className="text-[#2A2520]/70 text-sm">
            Bienvenue. Connectez-vous a votre compte.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#E8DFC9] p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2A2520] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F2E]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="vous@exemple.fr"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#E8DFC9] bg-[#F5F1E8]/50 text-[#2A2520] placeholder-[#2A2520]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-[#2A2520]">
                  Mot de passe
                </label>
                <a href="/forgot-password" className="inline-flex min-h-[44px] items-center text-xs text-[#8B6F2E] hover:text-[#C9A961] transition">
                  Mot de passe oublie ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F2E]" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#E8DFC9] bg-[#F5F1E8]/50 text-[#2A2520] focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-transparent transition"
                />
              </div>
            </div>

            {state.status === "error" && (
              <div className="rounded-lg bg-[#B85450]/10 border border-[#B85450]/20 px-4 py-3 text-sm text-[#B85450]">
                {state.message}
              </div>
            )}

            {state.status === "unverified" && (
              <div className="rounded-lg bg-[#D4A04C]/10 border border-[#D4A04C]/30 px-4 py-3 text-sm text-[#2A2520]">
                <p>{state.message}</p>
                {state.resendMessage && (
                  <p className="mt-2 text-xs text-[#2A2520]/70">{state.resendMessage}</p>
                )}
                <button
                  type="button"
                  onClick={() => void resendVerification(state.email)}
                  disabled={state.resendStatus === "sending"}
                  className="mt-3 inline-flex min-h-[40px] items-center rounded-lg bg-matrice-encre px-3 py-2 text-xs font-semibold text-matrice-ivoire hover:bg-matrice-bleu-nuit disabled:bg-matrice-sable disabled:text-matrice-encre/40"
                >
                  {state.resendStatus === "sending" ? "Renvoi..." : "Renvoyer l'email de confirmation"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={state.status === "submitting"}
              className="w-full bg-matrice-encre hover:bg-matrice-bleu-nuit text-matrice-ivoire font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-matrice-sable disabled:text-matrice-encre/40 disabled:cursor-not-allowed min-h-[48px]"
            >
              {state.status === "submitting" ? (
                "Connexion..."
              ) : (
                <>
                  Se connecter <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8DFC9] text-center text-sm text-[#2A2520]/70">
            Pas encore de compte ?{" "}
            <a href="/signup" className="inline-flex min-h-[44px] items-center text-[#8B6F2E] hover:text-[#C9A961] font-medium transition">
              Creer un compte
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-[#2A2520]/40 mt-6">
          En vous connectant, vous acceptez nos{" "}
          <Link href={`${BASE}/legal/cgu`} className="font-medium text-[#8B6F2E] underline-offset-2 hover:underline">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link href={`${BASE}/legal/confidentialite`} className="font-medium text-[#8B6F2E] underline-offset-2 hover:underline">
            politique de confidentialite
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
