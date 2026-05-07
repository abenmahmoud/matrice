import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const USER_TOKEN_KEY = "matrice_user_token";

export default function ResetPasswordPage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(() => (token ? "idle" : "error"));
  const [message, setMessage] = useState(token ? "" : "TOKEN_REQUIRED");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const response = await fetch(`${BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; token?: string | null };

    if (!response.ok) {
      setMessage(payload.error ?? "RESET_FAILED");
      setStatus("error");
      return;
    }

    if (payload.token) {
      localStorage.setItem(USER_TOKEN_KEY, payload.token);
    }
    setStatus("success");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#09090e] px-5 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#10101a] p-7 shadow-2xl shadow-black/35">
        <Link href={`${BASE}/`} className="mb-8 flex w-fit items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
            <Sparkles className="h-4 w-4" />
          </span>
          Matrice Narrative
        </Link>

        {status === "success" ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-300" />
            <h1 className="mt-6 text-2xl font-semibold">Mot de passe modifie</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">Tu peux reprendre ton travail dans Matrice.</p>
            <Button asChild className="mt-8 bg-violet-500 text-white hover:bg-violet-400">
              <Link href={`${BASE}/dashboard`}>
                Aller au dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
              <p className="mt-2 text-sm leading-6 text-white/55">Choisis un mot de passe de 8 caracteres minimum.</p>
            </div>
            <label className="block text-sm text-white/70">
              Mot de passe
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 border-white/[0.12] bg-black/25 text-white"
                placeholder="Nouveau mot de passe"
              />
            </label>

            {status === "error" && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
                {message}
              </div>
            )}

            <Button type="submit" disabled={status === "submitting" || !token} className="h-11 w-full bg-violet-500 text-white hover:bg-violet-400">
              {status === "submitting" ? "Modification..." : "Modifier le mot de passe"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
