import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications", "dropdown"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/notifications?limit=5`);
      if (!response.ok) throw new Error("NOTIFICATIONS_FAILED");
      return response.json() as Promise<{ notifications: NotificationItem[]; unread_count: number }>;
    },
    refetchInterval: 60_000,
  });
  const readAll = useMutation({
    mutationFn: () => apiFetch(`${BASE}/api/notifications/read-all`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`${BASE}/api/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = query.data?.unread_count ?? 0;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="relative flex min-h-[44px] w-11 items-center justify-center rounded-xl border border-matrice-sable bg-white text-matrice-encre/75 transition hover:bg-matrice-sable/35">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-matrice-error px-1.5 py-0.5 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-2xl shadow-black/15">
          <div className="flex items-center justify-between border-b border-matrice-sable px-4 py-3">
            <p className="text-sm font-semibold text-matrice-encre">Notifications</p>
            <button type="button" onClick={() => readAll.mutate()} className="inline-flex items-center gap-1 text-xs font-medium text-matrice-encre/65 hover:text-matrice-encre">
              <CheckCheck className="h-3.5 w-3.5" />
              Tout lu
            </button>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-2">
            {query.data?.notifications.length ? query.data.notifications.map((item) => (
              <Link key={item.id} href={item.actionUrl || "/notifications"}>
                <button type="button" onClick={() => { void markRead.mutate(item.id); setOpen(false); }} className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-matrice-sable/40">
                  <div className="flex gap-2">
                    {!item.readAt && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-matrice-error" />}
                    <div>
                      <p className="text-sm font-semibold text-matrice-encre">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-matrice-encre/65">{item.body}</p>
                    </div>
                  </div>
                </button>
              </Link>
            )) : (
              <p className="px-4 py-8 text-center text-sm text-matrice-encre/55">Rien a signaler.</p>
            )}
          </div>
          <Link href="/notifications" className="block border-t border-matrice-sable px-4 py-3 text-center text-sm font-medium text-matrice-encre hover:bg-matrice-sable/35">
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
