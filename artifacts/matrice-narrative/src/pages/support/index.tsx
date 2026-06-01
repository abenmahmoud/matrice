import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertCircle, CheckCircle2, Clock3, MessageCircle, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SmartBackButton } from "@/components/navigation/SmartBackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Ticket = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  updatedAt: string;
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
  general: "General",
  bug: "Bug",
  feature: "Idee",
  billing: "Facturation",
  mandate: "Mandat",
  export: "Export",
  account: "Compte",
};

export default function SupportPage() {
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["support", "tickets"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/support/tickets`);
      if (!response.ok) throw new Error("SUPPORT_FAILED");
      return response.json() as Promise<{ tickets: Ticket[] }>;
    },
  });

  const tickets = data?.tickets ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const statusMatch =
        status === "all" ||
        (status === "active" && !["resolved", "closed"].includes(ticket.status)) ||
        ticket.status === status;
      const searchMatch = !term || `${ticket.subject} ${ticket.category} ${ticket.priority}`.toLowerCase().includes(term);
      return statusMatch && searchMatch;
    });
  }, [search, status, tickets]);

  const stats = useMemo(() => ({
    active: tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length,
    waiting: tickets.filter((ticket) => ticket.status === "waiting_user").length,
    resolved: tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length,
  }), [tickets]);

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <SmartBackButton fallback="/dashboard" label="Retour au tableau de bord" avoidPrefixes={["/support"]} className="w-fit" />

        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Reclamations & support</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-matrice-encre">Mes reclamations</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/70">
                Ouvre un ticket pour un bug, une question de compte, un mandat, une facture ou un export. Tu gardes tout le suivi ici.
              </p>
            </div>
            <Link href="/support/new">
              <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                <Plus className="h-4 w-4" />
                Nouvelle reclamation
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={Clock3} label="En cours" value={stats.active} />
          <StatCard icon={AlertCircle} label="A repondre" value={stats.waiting} tone="warn" />
          <StatCard icon={CheckCircle2} label="Traitees" value={stats.resolved} tone="good" />
        </section>

        <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative block">
              <span className="sr-only">Rechercher</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-matrice-encre/45" />
              <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par sujet, categorie, priorite..." />
            </label>
            <select className="rounded-md border border-matrice-sable bg-white px-3 text-sm text-matrice-encre focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="active">Tickets actifs</option>
              <option value="all">Tous</option>
              <option value="open">Ouverts</option>
              <option value="in_progress">En cours</option>
              <option value="waiting_user">A repondre</option>
              <option value="resolved">Resolus</option>
              <option value="closed">Fermes</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
          {isLoading ? (
            <p className="p-6 text-sm text-matrice-encre/60">Chargement...</p>
          ) : error ? (
            <p className="p-6 text-sm text-matrice-error">Impossible de charger le support.</p>
          ) : filtered.length ? (
            <div className="divide-y divide-matrice-sable">
              {filtered.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : tickets.length ? (
            <p className="p-10 text-center text-sm text-matrice-encre/55">Aucun ticket ne correspond a ce filtre.</p>
          ) : (
            <div className="p-10 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-matrice-or-fonce" />
              <h2 className="mt-4 font-serif text-2xl text-matrice-encre">Aucune reclamation pour l'instant</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-matrice-encre/65">
                Quand quelque chose bloque, ouvre un fil. Tu recevras aussi une notification quand le support repond.
              </p>
              <Button asChild className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                <Link href="/support/new">Creer ma premiere reclamation</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/support/tickets/${ticket.id}`}>
      <article className="flex cursor-pointer gap-3 p-4 transition hover:bg-matrice-sable/35">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mobile-safe-wrap font-semibold text-matrice-encre">{ticket.subject}</h2>
            <StatusBadge status={ticket.status} />
            <span className="rounded-full bg-matrice-ivoire px-2 py-0.5 text-xs text-matrice-encre/65">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="mt-1 text-xs text-matrice-encre/50">
            Ouvert le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")} · mis a jour {new Date(ticket.updatedAt).toLocaleString("fr-FR")}
          </p>
        </div>
      </article>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "waiting_user"
    ? "bg-matrice-warning text-matrice-encre"
    : status === "resolved" || status === "closed"
      ? "bg-matrice-success text-white"
      : "bg-matrice-bleu-nuit text-matrice-ivoire";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{STATUS_LABELS[status] ?? status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const className = priority === "urgent" || priority === "high" ? "text-matrice-error" : "text-matrice-encre/55";
  return <span className={`text-xs font-medium ${className}`}>{priority}</span>;
}

function StatCard({ icon: Icon, label, value, tone = "neutral" }: { icon: typeof Clock3; label: string; value: number; tone?: "neutral" | "warn" | "good" }) {
  const color = tone === "good" ? "text-matrice-success" : tone === "warn" ? "text-matrice-warning" : "text-matrice-or-fonce";
  return (
    <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre/55">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold text-matrice-encre">{value}</p>
    </div>
  );
}
