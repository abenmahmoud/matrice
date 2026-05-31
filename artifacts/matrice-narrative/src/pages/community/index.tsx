import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MessageCircle, Pin, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Thread = {
  id: string;
  title: string;
  category: string;
  status: string;
  pinned: boolean;
  postsCount: number;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Général",
  entraide: "Entraide",
  extraits: "Extraits",
  annonces: "Annonces",
  feedback: "Retours",
};

const FILTERS = ["all", "general", "entraide", "extraits", "annonces", "feedback"];

export default function CommunityPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["community", "threads"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/community/threads`);
      if (!response.ok) throw new Error("Chargement impossible");
      return response.json() as Promise<{ threads: Thread[] }>;
    },
  });

  const threads = useMemo(() => {
    const list = data?.threads ?? [];
    return list.filter((thread) => {
      const okCategory = category === "all" || thread.category === category;
      const okSearch = !search || thread.title.toLowerCase().includes(search.toLowerCase());
      return okCategory && okSearch;
    });
  }, [data, category, search]);

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-matrice-encre">Communauté</h1>
            <p className="mt-1 text-sm text-matrice-encre/60">
              Échange avec les autres auteurs : entraide, partage d'extraits, retours et annonces.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
            <Link href="/community/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau sujet
            </Link>
          </Button>
        </header>

        <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm sm:p-5">
          <label className="relative block">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-matrice-encre/45" />
            <Input
              className="pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un sujet..."
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={
                  "rounded-full px-3 py-1 text-xs font-medium transition " +
                  (category === value
                    ? "bg-matrice-encre text-matrice-ivoire"
                    : "bg-matrice-ivoire text-matrice-encre/65 hover:bg-matrice-sable/60")
                }
              >
                {value === "all" ? "Tous" : CATEGORY_LABELS[value]}
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
          {isLoading ? (
            <p className="p-6 text-sm text-matrice-encre/60">Chargement...</p>
          ) : error ? (
            <p className="p-6 text-sm text-matrice-error">Impossible de charger les sujets.</p>
          ) : threads.length ? (
            <div className="divide-y divide-matrice-sable">
              {threads.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-matrice-or-fonce" />
              <h2 className="mt-4 font-serif text-2xl text-matrice-encre">Aucun sujet pour l'instant</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-matrice-encre/65">
                Lance la première discussion : pose une question, partage un extrait ou demande un retour.
              </p>
              <Button asChild className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                <Link href="/community/new">Créer le premier sujet</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}

function ThreadRow({ thread }: { thread: Thread }) {
  return (
    <Link href={`/community/${thread.id}`}>
      <article className="flex cursor-pointer gap-3 p-4 transition hover:bg-matrice-sable/35">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-matrice-terracotta/12 text-matrice-terracotta">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {thread.pinned && <Pin className="h-3.5 w-3.5 text-matrice-or-fonce" />}
            <h2 className="mobile-safe-wrap font-semibold text-matrice-encre">{thread.title}</h2>
            <span className="rounded-full bg-matrice-ivoire px-2 py-0.5 text-xs text-matrice-encre/65">
              {CATEGORY_LABELS[thread.category] ?? thread.category}
            </span>
            {thread.status === "closed" && (
              <span className="rounded-full bg-matrice-sable px-2 py-0.5 text-xs text-matrice-encre/55">Fermé</span>
            )}
          </div>
          <p className="mt-1 text-xs text-matrice-encre/50">
            {thread.authorName ?? "Auteur"} · {thread.postsCount} réponse{thread.postsCount > 1 ? "s" : ""} · mis à jour{" "}
            {new Date(thread.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </article>
    </Link>
  );
}
