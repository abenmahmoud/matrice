import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Lock, MessageSquare, Pin, RefreshCcw, ShieldAlert, Unlock } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminBits";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AuthUser = { id: string; role: string; displayName: string; email: string };
type Thread = {
  id: string;
  title: string;
  body?: string;
  category: string;
  status: "open" | "closed" | "hidden";
  pinned: boolean;
  postsCount: number;
  authorName?: string | null;
  updatedAt: string;
  createdAt: string;
};
type Post = {
  id: string;
  body: string;
  status: "visible" | "hidden";
  authorName?: string | null;
  createdAt: string;
};

export default function AdminCommunityPage() {
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const { data: me } = useQuery({
    queryKey: ["auth-me-admin-community"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/auth/me`);
      if (!response.ok) throw new Error("AUTH_REQUIRED");
      return response.json() as Promise<{ user: AuthUser }>;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-community-threads"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/community/threads`);
      if (!response.ok) throw new Error("Forum inaccessible");
      return response.json() as Promise<{ threads: Thread[] }>;
    },
  });

  const threads = data?.threads ?? [];
  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? threads[0] ?? null,
    [selectedThreadId, threads],
  );

  useEffect(() => {
    if (!selectedThreadId && threads[0]) setSelectedThreadId(threads[0].id);
  }, [selectedThreadId, threads]);

  const { data: detail } = useQuery({
    queryKey: ["admin-community-thread", selectedThread?.id],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/community/threads/${selectedThread?.id}`);
      if (!response.ok) throw new Error("Sujet inaccessible");
      return response.json() as Promise<{ thread: Thread; posts: Post[] }>;
    },
    enabled: Boolean(selectedThread?.id),
  });

  const moderateThread = useMutation({
    mutationFn: async ({ threadId, body }: { threadId: string; body: Record<string, unknown> }) => {
      const response = await apiFetch(`${BASE}/api/community/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Moderation impossible");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-community-threads"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-community-thread"] });
    },
  });

  const moderatePost = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: "visible" | "hidden" }) => {
      const response = await apiFetch(`${BASE}/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Moderation impossible");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-community-thread"] });
    },
  });

  const ownerOnly = me?.user.role !== "owner";

  return (
    <AdminShell title="Moderation communaute" subtitle="Pilote les sujets, epingles, masquages et fermetures du forum depuis le cockpit.">
      {ownerOnly ? (
        <div className="rounded-2xl border border-matrice-warning/30 bg-matrice-warning/10 p-5 text-sm text-matrice-encre">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-matrice-or-fonce" />
            Reserve owner
          </div>
          Cette page est visible dans le cockpit, mais les actions de moderation sont reservees au role owner.
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-matrice-encre">Sujets</h2>
            <span className="rounded-full bg-matrice-sable px-3 py-1 text-xs font-semibold text-matrice-encre">{threads.length} sujets</span>
          </div>

          {isLoading ? (
            <p className="text-sm text-matrice-encre/60">Chargement...</p>
          ) : threads.length ? (
            <div className="space-y-3">
              {threads.map((thread) => (
                <article
                  key={thread.id}
                  className={`rounded-xl border p-4 transition ${
                    selectedThread?.id === thread.id ? "border-matrice-or-fonce bg-matrice-sable/30" : "border-matrice-sable bg-white"
                  }`}
                >
                  <button type="button" className="w-full text-left" onClick={() => setSelectedThreadId(thread.id)}>
                    <div className="flex flex-wrap items-center gap-2">
                      {thread.pinned ? <Pin className="h-4 w-4 text-matrice-or-fonce" /> : null}
                      <h3 className="font-semibold text-matrice-encre">{thread.title}</h3>
                      <StatusPill status={thread.status} />
                    </div>
                    <p className="mt-1 text-xs text-matrice-encre/55">
                      {thread.category} - {thread.postsCount} reponses - {thread.authorName || "Auteur"}
                    </p>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminButton
                      variant="secondary"
                      disabled={ownerOnly || moderateThread.isPending}
                      onClick={() => moderateThread.mutate({ threadId: thread.id, body: { pinned: !thread.pinned } })}
                    >
                      <Pin className="h-4 w-4" />
                      {thread.pinned ? "Desepingler" : "Epingler"}
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      disabled={ownerOnly || moderateThread.isPending}
                      onClick={() => moderateThread.mutate({ threadId: thread.id, body: { status: thread.status === "closed" ? "open" : "closed" } })}
                    >
                      {thread.status === "closed" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {thread.status === "closed" ? "Rouvrir" : "Fermer"}
                    </AdminButton>
                    <AdminButton
                      variant={thread.status === "hidden" ? "secondary" : "danger"}
                      disabled={ownerOnly || moderateThread.isPending}
                      onClick={() => moderateThread.mutate({ threadId: thread.id, body: { status: thread.status === "hidden" ? "open" : "hidden" } })}
                    >
                      {thread.status === "hidden" ? <RefreshCcw className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {thread.status === "hidden" ? "Restaurer" : "Masquer"}
                    </AdminButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-matrice-encre/60">Aucun sujet pour le moment.</p>
          )}
        </div>

        <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-matrice-or-fonce" />
            <h2 className="font-serif text-2xl text-matrice-encre">Posts recents</h2>
          </div>

          {detail?.posts?.length ? (
            <div className="space-y-3">
              {detail.posts.slice(-8).reverse().map((post) => (
                <article key={post.id} className="rounded-xl border border-matrice-sable bg-matrice-ivoire/50 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-matrice-encre">{post.authorName || "Auteur"}</span>
                    <StatusPill status={post.status} />
                  </div>
                  <p className="line-clamp-4 text-sm leading-6 text-matrice-encre/72">{post.body}</p>
                  <div className="mt-3">
                    <AdminButton
                      variant={post.status === "hidden" ? "secondary" : "danger"}
                      disabled={ownerOnly || moderatePost.isPending}
                      onClick={() => moderatePost.mutate({ postId: post.id, status: post.status === "hidden" ? "visible" : "hidden" })}
                    >
                      {post.status === "hidden" ? <RefreshCcw className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {post.status === "hidden" ? "Restaurer le post" : "Masquer le post"}
                    </AdminButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-matrice-encre/60">Selectionne un sujet pour voir ses reponses.</p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "hidden"
    ? "bg-matrice-error/10 text-matrice-error"
    : status === "closed"
      ? "bg-matrice-warning/15 text-matrice-encre"
      : "bg-matrice-success/15 text-matrice-success";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
