import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Ticket = { id: string; subject: string; status: string; category: string; priority: string };
type Message = { id: string; senderType: "user" | "admin" | "system" | "ai"; body: string; createdAt: string };

export default function SupportTicketDetailPage() {
  const [, params] = useRoute("/support/tickets/:id");
  const id = params?.id ?? "";
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["support", "ticket", id],
    queryFn: async () => (await apiFetch(`${BASE}/api/support/tickets/${id}`)).json() as Promise<{ ticket: Ticket; messages: Message[] }>,
    enabled: !!id,
  });
  const send = useMutation({
    mutationFn: () => apiFetch(`${BASE}/api/support/tickets/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", id] });
    },
  });

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Ticket {data?.ticket.status}</p>
          <h1 className="mt-3 font-serif text-4xl text-matrice-encre">{data?.ticket.subject ?? "Ticket support"}</h1>
        </header>
        <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
          <div className="grid gap-3">
            {data?.messages.map((message) => (
              <article key={message.id} className={cn("max-w-[88%] rounded-2xl border p-4", message.senderType === "user" ? "ml-auto border-matrice-encre bg-matrice-encre text-matrice-ivoire" : message.senderType === "ai" ? "border-matrice-or-fonce/35 bg-matrice-sable/45 text-matrice-encre" : "border-matrice-sable bg-matrice-ivoire text-matrice-encre")}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{message.senderType === "ai" ? "Suggestion automatique" : message.senderType}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
              </article>
            ))}
          </div>
        </section>
        {data?.ticket.status !== "closed" && (
          <form onSubmit={(event) => { event.preventDefault(); send.mutate(); }} className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
            <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} placeholder="Répondre..." />
            <Button disabled={!body.trim() || send.isPending} className="mt-3 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
              <Send className="h-4 w-4" />
              Envoyer
            </Button>
          </form>
        )}
      </main>
    </AppLayout>
  );
}
