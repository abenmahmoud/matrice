import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetProject } from "@workspace/api-client-react";
import { ArrowRight, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LentilleHistory } from "@/components/lentille/LentilleHistory";
import type { LentilleHistoryItem } from "@/components/lentille/types";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type QuotaPayload = {
  limit: number;
  used: number;
  remaining: number;
  plan: string;
  upgrade_required: boolean;
};

type AnalysePayload = {
  project_id?: string;
  logline: string;
  synopsis: string;
  genre?: string;
  format_target?: "film" | "serie" | "microdrama" | "open";
  scenes?: string[];
};

function quotaText(quota?: QuotaPayload): string {
  if (!quota) return "Chargement du quota";
  if (quota.limit === -1) return "Analyses illimitées";
  return `${quota.used}/${quota.limit} analyses ce mois`;
}

export default function LentilleMarchePage() {
  const [, setLocation] = useLocation();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const projectId = params.get("project_id") ?? undefined;
  const [logline, setLogline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [genre, setGenre] = useState("");
  const [formatTarget, setFormatTarget] = useState<AnalysePayload["format_target"]>("open");
  const [scenes, setScenes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: project } = useGetProject(projectId ?? "", {
    query: { enabled: !!projectId, queryKey: [`/api/projects/${projectId}`] },
  });

  const { data: quota, isLoading: quotaLoading } = useQuery<QuotaPayload>({
    queryKey: ["/api/lentille-marche/quota"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/lentille-marche/quota`);
      return response.json() as Promise<QuotaPayload>;
    },
  });

  const { data: history = [] } = useQuery<LentilleHistoryItem[]>({
    queryKey: ["/api/lentille-marche/history"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/lentille-marche/history`);
      const payload = await response.json() as { analyses: LentilleHistoryItem[] };
      return payload.analyses;
    },
  });

  useEffect(() => {
    if (!project || logline || synopsis) return;
    setLogline(project.title && project.rawIdea ? `${project.title} : ${project.rawIdea}`.slice(0, 500) : project.rawIdea.slice(0, 500));
    setSynopsis(project.manuscriptExcerpt || project.rawIdea);
    setGenre(project.genre ?? "");
    const format = project.targetFormat?.toLowerCase();
    if (format?.includes("film") || format?.includes("cin")) setFormatTarget("film");
    else if (format?.includes("serie") || format?.includes("série")) setFormatTarget("serie");
    else setFormatTarget("open");
  }, [logline, project, synopsis]);

  const upgradeRequired = quota?.upgrade_required;
  const quotaExceeded = quota && quota.limit > 0 && quota.remaining <= 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: AnalysePayload = {
        ...(projectId ? { project_id: projectId } : {}),
        logline: logline.trim(),
        synopsis: synopsis.trim(),
        ...(genre.trim() ? { genre: genre.trim() } : {}),
        ...(formatTarget ? { format_target: formatTarget } : {}),
        scenes: scenes
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 10),
      };
      const response = await apiFetch(`${BASE}/api/lentille-marche/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({})) as { id?: string; error?: string; message?: string };
      if (!response.ok) {
        if (response.status === 503) throw new Error("DeepSeek n'est pas encore configuré sur ce serveur.");
        if (data.error === "QUOTA_EXCEEDED") throw new Error("Quota mensuel atteint pour la Lentille Marché.");
        if (data.error === "PLAN_UPGRADE_REQUIRED") throw new Error("Le plan Studio est requis pour lancer une analyse production.");
        throw new Error(data.message ?? data.error ?? `Erreur HTTP ${response.status}`);
      }
      if (!data.id) throw new Error("Analyse créée sans identifiant de résultat.");
      setLocation(`/lentille-marche/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell variant="travail">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-matrice-or-fonce">Lentille Marché</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-matrice-encre sm:text-5xl">Audit production 2026</h1>
            <p className="mt-4 text-base leading-relaxed text-matrice-encre/62">
              Analyse ton projet sous cinq angles de production : microdrama, IA-prod, pression spatiale,
              personnage déplacé et hybridation de genres.
            </p>
          </div>
          <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-matrice-sable bg-white px-4 text-sm text-matrice-encre/70">
            <Sparkles className="h-4 w-4 text-matrice-or-fonce" />
            {quotaText(quota)}
          </div>
        </header>

        {upgradeRequired ? (
          <section className="rounded-lg border border-matrice-sable bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-matrice-terracotta/12 text-matrice-terracotta">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-matrice-encre">Studio requis</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-matrice-encre/60">
              La Lentille Marché 2026 fait partie des modules d'analyse production avancés.
            </p>
            <Link href="/pricing">
              <Button className="mt-5 bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90">
                Voir les paliers <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-lg border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label htmlFor="logline" className="mb-2 block text-sm font-semibold text-matrice-encre">Logline</label>
                  <Textarea
                    id="logline"
                    required
                    minLength={20}
                    maxLength={500}
                    value={logline}
                    onChange={(event) => setLogline(event.target.value)}
                    className="min-h-28 resize-y border-matrice-sable bg-matrice-ivoire/45 text-base"
                    placeholder="Une phrase claire qui contient protagoniste, désir, obstacle et promesse dramatique."
                  />
                </div>

                <div>
                  <label htmlFor="synopsis" className="mb-2 block text-sm font-semibold text-matrice-encre">Synopsis</label>
                  <Textarea
                    id="synopsis"
                    required
                    minLength={50}
                    maxLength={5000}
                    value={synopsis}
                    onChange={(event) => setSynopsis(event.target.value)}
                    className="min-h-48 resize-y border-matrice-sable bg-matrice-ivoire/45 text-base"
                    placeholder="Résumé du projet, conflit central, trajectoire émotionnelle et univers."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="genre" className="mb-2 block text-sm font-semibold text-matrice-encre">Genre</label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(event) => setGenre(event.target.value)}
                      className="border-matrice-sable bg-matrice-ivoire/45 text-base"
                      placeholder="Thriller, romance, fantasy..."
                    />
                  </div>
                  <div>
                    <label htmlFor="format_target" className="mb-2 block text-sm font-semibold text-matrice-encre">Format visé</label>
                    <select
                      id="format_target"
                      value={formatTarget}
                      onChange={(event) => setFormatTarget(event.target.value as AnalysePayload["format_target"])}
                      className="w-full rounded-md border border-matrice-sable bg-matrice-ivoire/45 px-3 text-base text-matrice-encre"
                    >
                      <option value="open">Ouvert</option>
                      <option value="film">Film</option>
                      <option value="serie">Série</option>
                      <option value="microdrama">Microdrama</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="scenes" className="mb-2 block text-sm font-semibold text-matrice-encre">Scènes clés</label>
                  <Textarea
                    id="scenes"
                    value={scenes}
                    onChange={(event) => setScenes(event.target.value)}
                    className="min-h-32 resize-y border-matrice-sable bg-matrice-ivoire/45 text-base"
                    placeholder="Une scène par ligne, maximum 10."
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-matrice-error/20 bg-matrice-error/10 px-4 py-3 text-sm text-matrice-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting || quotaLoading || !!quotaExceeded}
                  className="w-full bg-matrice-terracotta text-white hover:bg-matrice-terracotta/90 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...
                    </>
                  ) : quotaExceeded ? (
                    "Quota mensuel atteint"
                  ) : (
                    <>
                      Lancer l'analyse <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </section>

            <aside className="space-y-4">
              <div className="rounded-lg border border-matrice-sable bg-white p-5">
                <h2 className="font-serif text-xl font-bold text-matrice-encre">Ce que l'audit mesure</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-matrice-encre/62">
                  <li>Microdrama et écriture verticale.</li>
                  <li>Production assistée par IA.</li>
                  <li>Pression spatiale et économie de tournage.</li>
                  <li>Personnage déplacé dans un monde codé.</li>
                  <li>Hybridation entre genre accessible et sujet profond.</li>
                </ul>
                <p className="mt-4 rounded-md bg-matrice-ivoire px-3 py-2 text-xs text-matrice-encre/55">
                  Analyse via DeepSeek V3. Coût estimé : environ quelques millièmes d'euro par audit.
                </p>
              </div>
              <div>
                <h2 className="mb-3 font-serif text-xl font-bold text-matrice-encre">Historique</h2>
                <LentilleHistory analyses={history} />
              </div>
            </aside>
          </div>
        )}
      </main>
    </PageShell>
  );
}
