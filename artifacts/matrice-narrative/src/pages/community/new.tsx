import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  { value: "general", label: "Général" },
  { value: "entraide", label: "Entraide" },
  { value: "extraits", label: "Partage d'extrait" },
  { value: "annonces", label: "Annonce" },
  { value: "feedback", label: "Demande de retour" },
];

export default function NewCommunityThreadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await apiFetch(`${BASE}/api/community/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category, body: body.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { thread?: { id: string }; error?: string };
      if (!response.ok || !payload.thread?.id) {
        throw new Error(payload.error ?? "Création impossible");
      }
      toast({ title: "Sujet publié", description: "Ton sujet est en ligne dans la communauté." });
      navigate(`/community/${payload.thread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = title.trim().length >= 3 && !submitting;

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/community"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-matrice-or-fonce hover:text-matrice-encre"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la communauté
        </Link>

        <form onSubmit={submit} className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <h1 className="font-serif text-2xl text-matrice-encre">Nouveau sujet</h1>
          <p className="mt-1 text-sm text-matrice-encre/60">
            Partage une question, un extrait ou une idée avec les autres auteurs.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-matrice-encre">Titre</span>
              <Input
                className="mt-1"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex : Comment gérer un récit à plusieurs voix ?"
                maxLength={160}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-matrice-encre">Catégorie</span>
              <select
                className="mt-1 w-full rounded-md border border-matrice-sable bg-white px-3 py-2 text-sm text-matrice-encre focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-matrice-encre">Message</span>
              <Textarea
                className="mt-1 min-h-[160px]"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Développe ton sujet..."
                maxLength={10000}
              />
            </label>

            {error && <p className="text-sm text-matrice-error">{error}</p>}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Publication..." : "Publier le sujet"}
            </Button>
          </div>
        </form>
      </main>
    </AppLayout>
  );
}
