import { useState } from "react";
import { useLocation } from "wouter";
import { Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function NewSupportTicketPage() {
  const [, navigate] = useLocation();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const response = await apiFetch(`${BASE}/api/support/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, category, priority, body }),
    });
    const payload = (await response.json().catch(() => ({}))) as { ticket_id?: string };
    setSubmitting(false);
    if (response.ok && payload.ticket_id) navigate(`/support/tickets/${payload.ticket_id}`);
  }

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Support</p>
          <h1 className="mt-3 font-serif text-4xl text-matrice-encre">Nouveau ticket</h1>
          <p className="mt-2 text-sm leading-6 text-matrice-encre/70">Décris ce qui bloque. Si une FAQ correspond, Matrice suggère une réponse automatique, sinon on reprend humainement.</p>
        </header>
        <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-matrice-encre">
              Sujet
              <Input value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={3} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                Catégorie
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-matrice-sable bg-white px-3">
                  {["general", "bug", "feature", "billing", "mandate", "export", "account"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                Priorité
                <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-11 rounded-lg border border-matrice-sable bg-white px-3">
                  {["low", "normal", "high", "urgent"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-matrice-encre">
              Message
              <Textarea value={body} onChange={(event) => setBody(event.target.value)} required minLength={5} rows={8} />
            </label>
          </div>
          <Button disabled={submitting} className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
            <Send className="h-4 w-4" />
            {submitting ? "Envoi..." : "Envoyer"}
          </Button>
        </form>
      </main>
    </AppLayout>
  );
}
