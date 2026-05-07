import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const response = await fetch(`${BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "RESET_REQUEST_FAILED");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#09090e] px-5 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#10101a] p-7 shadow-2xl shadow-black/35">
        <Link href={`${BASE}/signup`} className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Retour signup
        </Link>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Mot de passe oublie</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Entre ton email. Si le compte existe, Matrice prepare un lien de reinitialisation valable 1 heure.
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
            <Mail className="h-6 w-6 text-emerald-300" />
            <p className="mt-3 text-sm leading-6 text-emerald-50">
              Demande recue. Verifie ta boite email, ou l'expediteur Resend de test tant que le domaine n'est pas verifie.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
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

            {status === "error" && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
                {message}
              </div>
            )}

            <Button type="submit" disabled={status === "submitting"} className="h-11 w-full bg-violet-500 text-white hover:bg-violet-400">
              {status === "submitting" ? "Envoi..." : "Recevoir le lien"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
