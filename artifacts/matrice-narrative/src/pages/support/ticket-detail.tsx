import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Bot, CheckCircle2, CircleAlert, Clock3, Send, ShieldCheck, UserRound } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SmartBackButton } from "@/components/navigation/SmartBackButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Ticket = {
  id: string;
  subject: string;
  status: string;
  category: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
};

type Message = {
  id: string;
  senderType: "user" | "admin" | "system" | "ai";
  body: string;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  waiting_user: "A toi de repondre",
  resolved: "Resolu",
  closed: "Ferme",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Question generale",
  bug: "Bug ou erreur",
  feature: "Idee / fonctionnalite",
  billing: "Facturation / credits",
  mandate: "Mandat",
  export: "Export",
  account: "Compte",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export default function SupportTicketDetailPage() {
  const [, params] = useRoute("/support/tickets/:id");
  const id = params?.id ?? "";
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["support", "ticket", id],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/support/tickets/${id}`);
      if (!response.ok) throw new Error("Ticket introuvable");
      return response.json() as Promise<{ ticket: Ticket; messages: Message[] }>;
    },
    enabled: !!id,
  });

  const send = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Envoi impossible");
      return payload;
    },
    onSuccess: () => {
      setBody("");
      toast({ title: "Reponse envoyee", description: "Le fil de reclamation a ete mis a jour." });
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
    onError: (err) => {
      toast({
        title: "Message non envoye",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const ticket = data?.ticket;
  const isClosed = ticket?.status === "closed";

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <SmartBackButton fallback="/support" label="Retour" avoidPrefixes={["/support/new"]} className="w-fit" />

        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-matrice-encre/60">Chargement du ticket...</p>
          ) : error || !ticket ? (
            <div className="flex items-start gap-3 text-matrice-error">
              <CircleAlert className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Ticket introuvable</p>
                <p className="mt-1 text-sm">Il a peut-etre ete supprime ou tu n'y as pas acces.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} />
                <MetaBadge>{CATEGORY_LABELS[ticket.category] ?? ticket.category}</MetaBadge>
                <MetaBadge>{PRIORITY_LABELS[ticket.priority] ?? ticket.priority}</MetaBadge>
              </div>
              <h1 className="mobile-safe-wrap mt-4 font-serif text-4xl text-matrice-encre">{ticket.subject}</h1>
              <p className="mt-2 text-sm leading-6 text-matrice-encre/65">
                Ouvert le {formatDate(ticket.createdAt)} · derniere mise a jour {formatDate(ticket.updatedAt)}
              </p>
            </>
          )}
        </header>

        {ticket ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
              <div className="grid gap-4">
                {data?.messages.length ? (
                  data.messages.map((message) => <TicketMessage key={message.id} message={message} />)
                ) : (
                  <p className="p-6 text-center text-sm text-matrice-encre/55">Aucun message pour le moment.</p>
                )}
              </div>
            </section>

            <aside className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:self-start">
              <h2 className="font-serif text-2xl text-matrice-encre">Suivi</h2>
              <ol className="mt-5 space-y-4 text-sm text-matrice-encre/70">
                <TimelineItem icon={Clock3} label="Ticket cree" value={formatDate(ticket.createdAt)} done />
                <TimelineItem icon={ShieldCheck} label="Support notifie" value="BraveHeart le voit cote admin" done />
                <TimelineItem icon={CheckCircle2} label="Resolution" value={ticket.resolvedAt ? formatDate(ticket.resolvedAt) : "En attente"} done={!!ticket.resolvedAt} />
              </ol>
              {ticket.status === "waiting_user" ? (
                <p className="mt-5 rounded-xl border border-matrice-warning/40 bg-matrice-warning/12 p-3 text-sm leading-6 text-matrice-encre">
                  Le support attend ton retour. Ajoute une reponse dans le fil pour relancer le traitement.
                </p>
              ) : null}
            </aside>
          </div>
        ) : null}

        {ticket && !isClosed ? (
          <form onSubmit={(event) => void submitReply(event, body, send.mutate)} className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
            <label className="grid gap-2 text-sm font-medium text-matrice-encre">
              Repondre
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="Ajoute une precision, une capture de message d'erreur, ou reponds au support..."
              />
            </label>
            <Button disabled={!body.trim() || send.isPending} className="mt-3 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
              <Send className="h-4 w-4" />
              {send.isPending ? "Envoi..." : "Envoyer la reponse"}
            </Button>
          </form>
        ) : ticket ? (
          <div className="rounded-2xl border border-matrice-sable bg-matrice-sable/30 p-4 text-sm text-matrice-encre/70">
            Ce ticket est ferme. Cree une nouvelle reclamation si le probleme revient.
          </div>
        ) : null}
      </main>
    </AppLayout>
  );
}

function submitReply(event: FormEvent, body: string, mutate: () => void) {
  event.preventDefault();
  if (!body.trim()) return;
  mutate();
}

function TicketMessage({ message }: { message: Message }) {
  const isUser = message.senderType === "user";
  const isAi = message.senderType === "ai";
  const isAdmin = message.senderType === "admin";
  const label = isUser ? "Toi" : isAi ? "Suggestion automatique" : isAdmin ? "Support Matrice" : "Systeme";
  const Icon = isUser ? UserRound : isAi ? Bot : ShieldCheck;

  return (
    <article
      className={cn(
        "max-w-[92%] rounded-2xl border p-4",
        isUser
          ? "ml-auto border-matrice-encre bg-matrice-encre text-matrice-ivoire"
          : isAi
            ? "border-matrice-or-fonce/35 bg-matrice-sable/45 text-matrice-encre"
            : "border-matrice-sable bg-matrice-ivoire text-matrice-encre",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] opacity-75">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
        <span className="font-normal normal-case tracking-normal">{formatDate(message.createdAt)}</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "waiting_user"
    ? "bg-matrice-warning text-matrice-encre"
    : status === "resolved" || status === "closed"
      ? "bg-matrice-success text-white"
      : "bg-matrice-bleu-nuit text-matrice-ivoire";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{STATUS_LABELS[status] ?? status}</span>;
}

function MetaBadge({ children }: { children: string }) {
  return <span className="rounded-full bg-matrice-ivoire px-2.5 py-1 text-xs font-medium text-matrice-encre/70">{children}</span>;
}

function TimelineItem({ icon: Icon, label, value, done }: { icon: typeof Clock3; label: string; value: string; done?: boolean }) {
  return (
    <li className="flex gap-3">
      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", done ? "bg-matrice-success text-white" : "bg-matrice-sable text-matrice-encre/55")}>
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block font-semibold text-matrice-encre">{label}</span>
        <span>{value}</span>
      </span>
    </li>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
