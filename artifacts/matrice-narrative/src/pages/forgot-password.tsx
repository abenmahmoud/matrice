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

  function deliveryMessage(delivery: unknown): string {
    if (!delivery || typeof delivery !== "object") {
      return "Demande recue. Si le compte existe, un lien de reinitialisation est envoye.";
    }
    const status = "status" in delivery ? String(delivery.status) : "";
    if (status === "sent") return "Email envoye. Verifie ta boite de reception et tes spams.";
    if (status === "skipped") return "Email non envoye : configuration email absente sur le serveur.";
    if (status === "failed") return "Email non envoye : l'expediteur ou la cle email doit etre verifie. Reessaie plus tard ou contacte le support.";
    return "Demande recue.";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const response = await fetch(`${BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; emailDelivery?: unknown };

    if (!response.ok) {
      setMessage(payload.error ?? "RESET_REQUEST_FAILED");
      setStatus("error");
      return;
    }

    setMessage(deliveryMessage(payload.emailDelivery));
    setStatus("sent");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-matrice-ivoire px-5 text-matrice-encre">
      <div className="w-full max-w-lg rounded-2xl border border-matrice-sable bg-white p-7 shadow-2xl shadow-black/10">
        <Link href={`${BASE}/signup`} className="mb-8 inline-flex items-center gap-2 text-sm text-matrice-encre/55 transition hover:text-matrice-terracotta">
          <ArrowLeft className="h-4 w-4" />
          Retour signup
        </Link>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Mot de passe oublie</h1>
        <p className="mt-3 text-sm leading-6 text-matrice-encre/62">
          Entre ton email. Si le compte existe, Matrice prepare un lien de reinitialisation valable 1 heure.
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
            <Mail className="h-6 w-6 text-emerald-300" />
            <p className="mt-3 text-sm leading-6 text-matrice-encre">
              {message}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
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

            {status === "error" && (
              <div className="rounded-xl border border-matrice-error/25 bg-matrice-error/10 p-3 text-sm text-matrice-error">
                {message}
              </div>
            )}

            <Button type="submit" disabled={status === "submitting"} className="h-11 w-full bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
              {status === "submitting" ? "Envoi..." : "Recevoir le lien"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
