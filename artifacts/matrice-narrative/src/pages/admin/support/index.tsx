import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MessageSquare } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Ticket = { id: string; userId: string; subject: string; category: string; priority: string; status: string; updatedAt: string };

export default function AdminSupportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-support", "tickets"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/support/tickets`);
      if (!response.ok) throw new Error("ADMIN_SUPPORT_FAILED");
      return response.json() as Promise<{ tickets: Ticket[] }>;
    },
  });
  return (
    <AdminShell title="Support testeurs" subtitle="Tickets ouverts par les beta testeurs, avec priorite et statut.">
      <section className="rounded-2xl border border-matrice-sable bg-white p-2 shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-matrice-encre/60">Chargement...</p>
        ) : data?.tickets.length ? data.tickets.map((ticket) => (
          <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
            <article className="flex cursor-pointer gap-3 rounded-xl p-4 transition hover:bg-matrice-sable/35">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-matrice-encre">{ticket.subject}</h2>
                  <span className="rounded-full bg-matrice-sable px-2 py-0.5 text-xs font-semibold text-matrice-encre">{ticket.status}</span>
                  <span className="rounded-full bg-matrice-ivoire px-2 py-0.5 text-xs text-matrice-encre/65">{ticket.priority}</span>
                </div>
                <p className="mt-1 text-xs text-matrice-encre/50">{ticket.category} · {new Date(ticket.updatedAt).toLocaleString("fr-FR")}</p>
              </div>
            </article>
          </Link>
        )) : (
          <p className="p-10 text-center text-sm text-matrice-encre/55">Aucun ticket actif.</p>
        )}
      </section>
    </AdminShell>
  );
}
