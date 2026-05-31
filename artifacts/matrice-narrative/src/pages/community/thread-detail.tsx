import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ArrowLeft, CircleAlert, Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORY_LABELS: Record<string, string> = {
  general: "Général",
  entraide: "Entraide",
  extraits: "Extraits",
  annonces: "Annonces",
  feedback: "Retours",
};

type Thread = {
  id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  pinned: boolean;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

type Post = {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
};

export default function CommunityThreadPage() {
  const [, params] = useRoute("/community/:id");
  const id = params?.id ?? "";
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["community", "thread", id],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/community/threads/${id}`);
      if (!response.ok) throw new Error("Sujet introuvable");
      return response.json() as Promise<{ thread: Thread; posts: Post[] }>;
    },
    enabled: !!id,
  });

  const send = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/community/threads/${id}/posts`, {
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
      queryClient.invalidateQueries({ queryKey: ["community", "thread", id] });
      queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
    },
    onError: (err) => {
      toast({
        title: "Réponse non envoyée",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const thread = data?.thread;
  const posts = data?.posts ?? [];
  const isClosed = thread?.status === "closed";

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/community"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-matrice-or-fonce hover:text-matrice-encre"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la communauté
        </Link>

        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-matrice-encre/60">Chargement du sujet...</p>
          ) : error || !thread ? (
            <div className="flex items-start gap-3 text-matrice-error">
              <CircleAlert className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Sujet introuvable</p>
                <p className="text-sm text-matrice-encre/60">Ce sujet n'existe pas ou n'est plus disponible.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-matrice-ivoire px-2 py-0.5 text-xs text-matrice-encre/65">
                  {CATEGORY_LABELS[thread.category] ?? thread.category}
                </span>
                {isClosed && (
                  <span className="rounded-full bg-matrice-sable px-2 py-0.5 text-xs text-matrice-encre/55">Fermé</span>
                )}
              </div>
              <h1 className="mt-2 font-serif text-2xl text-matrice-encre">{thread.title}</h1>
              <p className="mt-1 text-xs text-matrice-encre/50">
                {thread.authorName ?? "Auteur"} · {new Date(thread.createdAt).toLocaleDateString("fr-FR")}
              </p>
              {thread.body && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-matrice-encre/85">{thread.body}</p>
              )}
            </>
          )}
        </header>

        {thread && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-matrice-encre/70">
              {posts.length} réponse{posts.length > 1 ? "s" : ""}
            </h2>
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
                <p className="text-xs text-matrice-encre/50">
                  {post.authorName ?? "Auteur"} · {new Date(post.createdAt).toLocaleString("fr-FR")}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-matrice-encre/85">{post.body}</p>
              </article>
            ))}

            {isClosed ? (
              <p className="rounded-2xl border border-matrice-sable bg-matrice-ivoire/60 p-4 text-sm text-matrice-encre/60">
                Ce sujet est fermé : il n'accepte plus de nouvelles réponses.
              </p>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (body.trim().length > 0) send.mutate();
                }}
                className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm"
              >
                <Textarea
                  className="min-h-[100px]"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Écris ta réponse..."
                  maxLength={10000}
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={body.trim().length === 0 || send.isPending}
                    className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {send.isPending ? "Envoi..." : "Répondre"}
                  </Button>
                </div>
              </form>
            )}
          </section>
        )}
      </main>
    </AppLayout>
  );
}
