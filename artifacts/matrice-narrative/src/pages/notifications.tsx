import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bell, CheckCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/notifications?limit=50`);
      if (!response.ok) throw new Error("NOTIFICATIONS_FAILED");
      return response.json() as Promise<{ notifications: NotificationItem[]; unread_count: number }>;
    },
  });
  const readAll = useMutation({
    mutationFn: () => apiFetch(`${BASE}/api/notifications/read-all`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Centre de notifications</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-matrice-encre">Notifications</h1>
              <p className="mt-2 text-sm text-matrice-encre/70">{data?.unread_count ?? 0} non lue{(data?.unread_count ?? 0) > 1 ? "s" : ""}</p>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={() => readAll.mutate()}>
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          </div>
        </header>

        <section className="rounded-2xl border border-matrice-sable bg-white p-2 shadow-sm">
          {isLoading ? (
            <p className="p-6 text-sm text-matrice-encre/60">Chargement...</p>
          ) : data?.notifications.length ? data.notifications.map((item) => (
            <Link key={item.id} href={item.actionUrl || "/notifications"}>
              <article className="flex cursor-pointer gap-3 rounded-xl p-4 transition hover:bg-matrice-sable/35">
                <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!item.readAt && <span className="h-2 w-2 rounded-full bg-matrice-error" />}
                    <h2 className="font-semibold text-matrice-encre">{item.title}</h2>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-matrice-encre/68">{item.body}</p>
                  <p className="mt-2 text-xs text-matrice-encre/45">{new Date(item.createdAt).toLocaleString("fr-FR")}</p>
                </div>
              </article>
            </Link>
          )) : (
            <p className="p-10 text-center text-sm text-matrice-encre/55">Aucune notification pour l’instant.</p>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
