import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MessageCircle, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Ticket = { id: string; subject: string; category: string; priority: string; status: string; updatedAt: string; createdAt: string };

export default function SupportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["support", "tickets"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/support/tickets`);
      if (!response.ok) throw new Error("SUPPORT_FAILED");
      return response.json() as Promise<{ tickets: Ticket[] }>;
    },
  });
  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Support beta</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-matrice-encre">Tickets support</h1>
              <p className="mt-2 text-sm leading-6 text-matrice-encre/70">Une question, un bug, un doute sur un mandat : ouvre un fil, BraveHeart le voit côté admin.</p>
            </div>
            <Link href="/support/new">
              <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                <Plus className="h-4 w-4" />
                Nouveau ticket
              </Button>
            </Link>
          </div>
        </header>
        <section className="rounded-2xl border border-matrice-sable bg-white p-2 shadow-sm">
          {isLoading ? (
            <p className="p-6 text-sm text-matrice-encre/60">Chargement...</p>
          ) : data?.tickets.length ? data.tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
              <article className="flex cursor-pointer gap-3 rounded-xl p-4 transition hover:bg-matrice-sable/35">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-matrice-encre">{ticket.subject}</h2>
                    <span className="rounded-full bg-matrice-sable px-2 py-0.5 text-xs font-semibold text-matrice-encre">{ticket.status}</span>
                    <span className="rounded-full bg-matrice-ivoire px-2 py-0.5 text-xs text-matrice-encre/65">{ticket.category}</span>
                  </div>
                  <p className="mt-1 text-xs text-matrice-encre/50">Mis à jour {new Date(ticket.updatedAt).toLocaleString("fr-FR")}</p>
                </div>
              </article>
            </Link>
          )) : (
            <p className="p-10 text-center text-sm text-matrice-encre/55">Aucun ticket pour l’instant.</p>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
