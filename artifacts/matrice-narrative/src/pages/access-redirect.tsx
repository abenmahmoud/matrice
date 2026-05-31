import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, LockKeyhole, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CONTENT = {
  "/auth-required": {
    icon: LockKeyhole,
    title: "Connexion requise",
    text: "Cree ou confirme ton compte pour continuer dans Matrice.",
    primary: "Creer un compte",
    href: "/signup",
  },
  "/upgrade": {
    icon: Sparkles,
    title: "Palier requis",
    text: "Cette action necessite un acces Studio.",
    primary: "Voir les paliers",
    href: "/pricing",
  },
  "/forbidden": {
    icon: ShieldAlert,
    title: "Acces protege",
    text: "Cette zone necessite une autorisation Studio.",
    primary: "Retour dashboard",
    href: "/dashboard",
  },
};

export default function AccessRedirectPage() {
  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");
  const content = CONTENT[location as keyof typeof CONTENT] ?? CONTENT["/forbidden"];
  const Icon = content.icon;

  async function resendVerification() {
    if (!email.trim()) return;
    setResendStatus("sending");
    const response = await fetch(`${BASE}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; emailDelivery?: { status?: string } };
    if (!response.ok) {
      setResendStatus("error");
      setResendMessage(payload.error ?? "Renvoi impossible pour le moment.");
      return;
    }
    setResendStatus("sent");
    setResendMessage(payload.emailDelivery?.status === "sent" ? "Email de confirmation envoye." : "Demande traitee. Si l'email ne part pas, contacte le support.");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-matrice-ivoire px-5 text-matrice-encre">
      <div className="w-full max-w-lg rounded-2xl border border-matrice-sable bg-white p-7 text-center shadow-2xl shadow-black/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-matrice-terracotta/12 text-matrice-terracotta">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{content.title}</h1>
        <p className="mt-3 text-sm leading-6 text-matrice-encre/62">{content.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
            <Link href={`${BASE}${content.href}`}>
              {content.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`${BASE}/`}>Accueil</Link>
          </Button>
        </div>
        {location === "/auth-required" && (
          <div className="mt-5 space-y-3">
            <Link
              href={`${BASE}/login`}
              className="inline-flex items-center gap-2 text-sm text-matrice-encre/62 transition hover:text-matrice-or-fonce"
            >
              J&apos;ai deja un compte
              <ArrowRight className="h-4 w-4" />
              Se connecter
            </Link>
            <div className="rounded-xl border border-matrice-sable bg-matrice-ivoire/60 p-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-matrice-or-fonce">Email non confirme ?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="toi@email.com"
                />
                <Button type="button" disabled={resendStatus === "sending" || !email.trim()} onClick={() => void resendVerification()}>
                  {resendStatus === "sending" ? "Renvoi..." : "Renvoyer"}
                </Button>
              </div>
              {resendMessage && (
                <p className={resendStatus === "error" ? "mt-2 text-xs text-matrice-error" : "mt-2 text-xs text-matrice-encre/65"}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
