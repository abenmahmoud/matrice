import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { setUserToken } from "@/lib/userAuth";

type LoginState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success" };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const response = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      token?: string;
      next?: string;
    };

    if (!response.ok) {
      let message = "Identifiants invalides. Vérifiez votre email et votre mot de passe.";
      if (payload.error === "EMAIL_NOT_VERIFIED") {
        message = "Confirmez votre email avant de vous connecter.";
      } else if (payload.error === "ACCOUNT_LOCKED") {
        message = "Compte temporairement verrouillé. Réessayez dans quelques minutes.";
      }
      setState({ status: "error", message });
      return;
    }

    if (!payload.token) {
      setState({ status: "error", message: "Connexion réussie, mais le jeton de session est manquant." });
      return;
    }

    setUserToken(payload.token);
    setState({ status: "success" });
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next") ?? payload.next ?? "/dashboard";
    setLocation(next);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-[0.2em] text-[#C9A961] mb-2">
            ESSUF · MATRICE
          </h1>
          <p className="text-[#2A2520]/70 text-sm">
            Bienvenue. Connectez-vous à votre compte.
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
                  Mot de passe oublié ?
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
              Créer un compte
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-[#2A2520]/40 mt-6">
          En vous connectant, vous acceptez nos conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
