import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  { value: "general", label: "Question generale" },
  { value: "bug", label: "Bug ou erreur" },
  { value: "feature", label: "Idee / fonctionnalite" },
  { value: "billing", label: "Facturation / credits" },
  { value: "mandate", label: "Mandat" },
  { value: "export", label: "Export" },
  { value: "account", label: "Compte" },
];

const PRIORITIES = [
  { value: "low", label: "Faible" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];

export default function NewSupportTicketPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await apiFetch(`${BASE}/api/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), category, priority, body: body.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ticket_id?: string; error?: string };
      if (!response.ok || !payload.ticket_id) {
        throw new Error(payload.error ?? "Creation impossible");
      }
      toast({
        title: "Reclamation envoyee",
        description: "Accuse de reception cree. Tu peux suivre la conversation dans ce fil.",
      });
      navigate(`/support/tickets/${payload.ticket_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/support" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-matrice-or-fonce hover:text-matrice-encre">
          <ArrowLeft className="h-4 w-4" />
          Retour au support
        </Link>

        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Nouvelle reclamation</p>
          <h1 className="mt-3 font-serif text-4xl text-matrice-encre">Decris ce qui bloque</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/70">
            Plus ton message est concret, plus vite on peut traiter. Si une FAQ correspond, une suggestion automatique apparaitra dans le fil.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                Sujet
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={3} maxLength={200} placeholder="Ex : probleme export PDF KDP" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                  Categorie
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-matrice-sable bg-white px-3 focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce">
                    {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                  Priorite
                  <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-11 rounded-lg border border-matrice-sable bg-white px-3 focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce">
                    {PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                Message
                <Textarea value={body} onChange={(event) => setBody(event.target.value)} required minLength={5} maxLength={5000} rows={9} placeholder="Page concernee, action faite, resultat attendu, message d'erreur si tu en as un..." />
              </label>
            </div>
            {error ? <p className="mt-4 rounded-lg border border-matrice-error/30 bg-matrice-error/10 px-3 py-2 text-sm text-matrice-error">{error}</p> : null}
            <Button disabled={submitting || subject.trim().length < 3 || body.trim().length < 5} className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
              <Send className="h-4 w-4" />
              {submitting ? "Envoi..." : "Envoyer la reclamation"}
            </Button>
          </form>

          <aside className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-matrice-encre">Ce qui aide</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-matrice-encre/70">
              {[
                "La page ou tu etais.",
                "Le bouton ou l'action utilisee.",
                "Le resultat attendu.",
                "Le message d'erreur exact, si present.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-matrice-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </AppLayout>
  );
}
