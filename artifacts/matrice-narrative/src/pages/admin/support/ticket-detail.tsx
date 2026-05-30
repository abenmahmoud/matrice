import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Send } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminBits";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Ticket = { id: string; subject: string; status: string; category: string; priority: string };
type Message = { id: string; senderType: "user" | "admin" | "system" | "ai"; body: string; createdAt: string };

export default function AdminSupportTicketPage() {
  const [, params] = useRoute("/admin/support/:id");
  const id = params?.id ?? "";
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-support", "ticket", id],
    queryFn: async () => (await apiFetch(`${BASE}/api/admin/support/tickets/${id}`)).json() as Promise<{ ticket: Ticket; messages: Message[] }>,
    enabled: !!id,
  });
  const send = useMutation({
    mutationFn: () => apiFetch(`${BASE}/api/admin/support/tickets/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-support", "ticket", id] });
    },
  });
  const setStatus = useMutation({
    mutationFn: (status: string) => apiFetch(`${BASE}/api/admin/support/tickets/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-support", "ticket", id] }),
  });

  return (
    <AdminShell title={data?.ticket.subject ?? "Ticket"} subtitle={`Statut ${data?.ticket.status ?? ""} · ${data?.ticket.category ?? ""}`}>
      <div className="flex flex-wrap gap-2">
        {["in_progress", "waiting_user", "resolved", "closed"].map((status) => (
          <AdminButton key={status} variant="secondary" onClick={() => setStatus.mutate(status)}>{status}</AdminButton>
        ))}
      </div>
      <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
        <div className="grid gap-3">
          {data?.messages.map((message) => (
            <article key={message.id} className={cn("max-w-[88%] rounded-2xl border p-4", message.senderType === "admin" ? "ml-auto border-matrice-encre bg-matrice-encre text-matrice-ivoire" : message.senderType === "ai" ? "border-matrice-or-fonce/35 bg-matrice-sable/45 text-matrice-encre" : "border-matrice-sable bg-matrice-ivoire text-matrice-encre")}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{message.senderType}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
            </article>
          ))}
        </div>
      </section>
      {data?.ticket.status !== "closed" && (
        <form onSubmit={(event) => { event.preventDefault(); send.mutate(); }} className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} placeholder="Réponse support..." />
          <AdminButton disabled={!body.trim() || send.isPending} className="mt-3">
            <Send className="h-4 w-4" />
            Répondre
          </AdminButton>
        </form>
      )}
    </AdminShell>
  );
}
