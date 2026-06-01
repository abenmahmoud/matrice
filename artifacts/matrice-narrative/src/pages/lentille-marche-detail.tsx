import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileDown, Loader2, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { AxisCard } from "@/components/lentille/AxisCard";
import { BudgetEstimate } from "@/components/lentille/BudgetEstimate";
import { FormatRecommendation } from "@/components/lentille/FormatRecommendation";
import { HookProposal } from "@/components/lentille/HookProposal";
import { PropositionBlock } from "@/components/lentille/PropositionBlock";
import { ScoreGauge } from "@/components/lentille/ScoreGauge";
import { apiFetch } from "@/lib/apiFetch";
import {
  analysisRowToResult,
  type LentilleAnalysisRow,
  type LentilleEpisode,
  type LentilleResult,
} from "@/components/lentille/types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatDate(value: string): string {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl font-bold text-matrice-encre">{title}</h2>
      {children}
    </section>
  );
}

function PointsList({ points }: { points: string[] }) {
  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-matrice-sable bg-white/60 p-5 text-sm text-matrice-encre/55">
        Aucun point détaillé disponible pour cette section.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {points.map((point, index) => (
        <li key={`${point}-${index}`} className="rounded-lg border border-matrice-sable bg-white p-4 text-sm leading-relaxed text-matrice-encre/72">
          {point}
        </li>
      ))}
    </ul>
  );
}

function EpisodesPreview({ episodes }: { episodes: LentilleEpisode[] }) {
  if (episodes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-matrice-sable bg-white/60 p-5 text-sm text-matrice-encre/55">
        Version microdrama non disponible.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {episodes.map((episode, index) => (
        <article key={`${episode.title}-${index}`} className="rounded-lg border border-matrice-sable bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Episode {index + 1}</p>
          <h3 className="mt-2 font-serif text-xl font-bold text-matrice-encre">{episode.title || `Episode ${index + 1}`}</h3>
          <p className="mt-3 text-sm leading-relaxed text-matrice-encre/65">{episode.summary}</p>
          {episode.cliffhanger && (
            <p className="mt-4 rounded-md bg-matrice-ivoire px-3 py-2 text-xs leading-relaxed text-matrice-encre/62">
              Cliffhanger : {episode.cliffhanger}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function HybridationBlock({ proposal }: { proposal: LentilleResult["hybridation_proposal"] }) {
  return (
    <div className="grid gap-4 rounded-lg border border-matrice-sable bg-white p-5 md:grid-cols-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Genre porte</p>
        <p className="mt-2 text-sm leading-relaxed text-matrice-encre/70">{proposal.genre_porte || "Non précisé"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Thème profond</p>
        <p className="mt-2 text-sm leading-relaxed text-matrice-encre/70">{proposal.theme_profond || "Non précisé"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Exemple</p>
        <p className="mt-2 text-sm leading-relaxed text-matrice-encre/70">{proposal.exemple || "Non précisé"}</p>
      </div>
    </div>
  );
}

export default function LentilleMarcheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<{ row: LentilleAnalysisRow; result: LentilleResult }>({
    queryKey: [`/api/lentille-marche/${id}`],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/lentille-marche/${id}`);
      const payload = (await response.json()) as { analyse: LentilleAnalysisRow };
      return { row: payload.analyse, result: analysisRowToResult(payload.analyse) };
    },
    enabled: !!id,
  });

  async function deleteAnalysis() {
    if (!id || !window.confirm("Supprimer cet audit Lentille Marché ?")) return;
    const response = await apiFetch(`${BASE}/api/lentille-marche/${id}`, { method: "DELETE" });
    if (response.ok) setLocation("/lentille-marche");
  }

  if (isLoading) {
    return (
      <PageShell variant="travail">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="flex items-center gap-3 text-matrice-encre/60">
            <Loader2 className="h-5 w-5 animate-spin text-matrice-terracotta" />
            Chargement de l'audit...
          </div>
        </main>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell variant="travail">
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link href="/lentille-marche" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-matrice-or-fonce">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <div className="mt-8 rounded-lg border border-matrice-sable bg-white p-6">
            <h1 className="font-serif text-2xl font-bold text-matrice-encre">Audit introuvable</h1>
            <p className="mt-2 text-sm text-matrice-encre/60">Cette analyse n'existe pas ou n'est pas accessible avec ce compte.</p>
          </div>
        </main>
      </PageShell>
    );
  }

  const { row, result } = data;

  return (
    <PageShell variant="travail">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/lentille-marche" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-matrice-or-fonce">
          <ArrowLeft className="h-4 w-4" /> Tous les audits
        </Link>

        <header className="mt-4 grid gap-6 rounded-lg border border-matrice-sable bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px] lg:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">
              <Sparkles className="h-4 w-4" />
              Lentille Marché 2026
            </div>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-matrice-encre sm:text-4xl">
              Audit production
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-matrice-encre/66">
              {row.inputLogline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-matrice-encre/55">
              {row.inputGenre && <span className="rounded-full bg-matrice-ivoire px-3 py-1.5">{row.inputGenre}</span>}
              {row.inputFormatTarget && <span className="rounded-full bg-matrice-ivoire px-3 py-1.5">Format visé : {row.inputFormatTarget}</span>}
              <span className="rounded-full bg-matrice-ivoire px-3 py-1.5">{formatDate(row.createdAt)}</span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <ScoreGauge score={result.scores.global} />
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AxisCard axe="microdrama" score={result.scores.microdrama} />
          <AxisCard axe="ai_prod" score={result.scores.ai_prod} />
          <AxisCard axe="pression_spatiale" score={result.scores.pression_spatiale} />
          <AxisCard axe="perso_deplace" score={result.scores.perso_deplace} />
          <AxisCard axe="hybridation" score={result.scores.hybridation} />
        </div>

        <div className="mt-10 space-y-10">
          <Section title="Déjà compatible 2026">
            <PointsList points={result.diagnostic_compatible.points} />
          </Section>

          <Section title="À renforcer">
            <PointsList points={result.diagnostic_renforcer.points} />
          </Section>

          <Section title="Propositions concrètes">
            <div className="grid gap-4 md:grid-cols-2">
              {result.propositions.length > 0
                ? result.propositions.map((proposition, index) => <PropositionBlock key={`${proposition.axe}-${index}`} proposition={proposition} />)
                : <div className="rounded-lg border border-dashed border-matrice-sable bg-white/60 p-5 text-sm text-matrice-encre/55">Aucune proposition disponible.</div>}
            </div>
          </Section>

          <Section title="Hook d'ouverture 10 secondes">
            <HookProposal text={result.hook_10s} />
          </Section>

          <Section title="Version microdrama verticale">
            <EpisodesPreview episodes={result.microdrama_version.episodes} />
          </Section>

          <Section title="Budget production">
            <BudgetEstimate estimate={result.budget_estimate} />
          </Section>

          <Section title="Hybridation proposée">
            <HybridationBlock proposal={result.hybridation_proposal} />
          </Section>

          <Section title="Format recommandé">
            <FormatRecommendation format={result.format_recommendation} reasoning={result.format_reasoning} />
          </Section>
        </div>

        <footer className="mt-10 flex flex-col gap-3 border-t border-matrice-sable pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-matrice-encre/48">
            Modèle : {row.modelUsed} · {row.tokensUsed} tokens · coût estimé {Number(row.costEur).toFixed(4)} €
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/lentille-marche">
              <Button variant="outline" className="min-h-[44px] border-matrice-sable">
                <RotateCcw className="mr-2 h-4 w-4" /> Nouvelle analyse
              </Button>
            </Link>
            <Button type="button" variant="outline" onClick={() => window.print()} className="min-h-[44px] border-matrice-sable">
              <FileDown className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button type="button" variant="outline" onClick={() => void deleteAnalysis()} className="min-h-[44px] border-matrice-error/25 text-matrice-error hover:bg-matrice-error/10">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>
        </footer>
      </main>
    </PageShell>
  );
}
