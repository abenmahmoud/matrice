import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setUserToken } from "@/lib/userAuth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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
      setUserToken(payload.token);
    }
    setStatus("success");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-matrice-ivoire px-5 text-matrice-encre">
      <div className="w-full max-w-lg rounded-2xl border border-matrice-sable bg-white p-7 shadow-2xl shadow-black/10">
        <Link href={`${BASE}/`} className="mb-8 flex w-fit items-center gap-3 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-matrice-terracotta/12 text-matrice-terracotta">
            <Sparkles className="h-4 w-4" />
          </span>
          Matrice Narrative
        </Link>

        {status === "success" ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-300" />
            <h1 className="mt-6 text-2xl font-semibold">Mot de passe modifie</h1>
            <p className="mt-3 text-sm leading-6 text-matrice-encre/62">Tu peux reprendre ton travail dans Matrice.</p>
            <Button asChild className="mt-8 bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
              <Link href={`${BASE}/dashboard`}>
                Aller au dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
              <p className="mt-2 text-sm leading-6 text-matrice-encre/62">Choisis un mot de passe de 10 caracteres minimum, non courant.</p>
            </div>
            <label className="block text-sm text-matrice-encre/72">
              Mot de passe
              <Input
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 border-matrice-sable bg-matrice-ivoire/60 text-matrice-encre"
                placeholder="Nouveau mot de passe"
              />
            </label>

            {status === "error" && (
              <div className="rounded-xl border border-matrice-error/25 bg-matrice-error/10 p-3 text-sm text-matrice-error">
                {message}
              </div>
            )}

            <Button type="submit" disabled={status === "submitting" || !token} className="h-11 w-full bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
              {status === "submitting" ? "Modification..." : "Modifier le mot de passe"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
