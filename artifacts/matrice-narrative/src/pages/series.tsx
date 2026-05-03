import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetSeries, useGenerateSeries, getGetSeriesQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Tv, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { motion } from "framer-motion";
import { useState } from "react";

type SeriesEpisode = {
  number: number;
  title: string;
  logline?: string;
  summary: string;
  openingScene?: string;
  questionDramatique?: string;
  intrigueA?: string;
  intrigueB?: string;
  midpoint?: string;
  climax?: string;
  cliffhanger?: string;
  emotionalEvolution?: string;
  humourOrganique?: string;
  momentDePleur?: string;
  keyReveal?: string;
  toneNote?: string;
  lienArcSaison?: string;
};

function EpisodeCard({ ep, index }: { ep: SeriesEpisode; index: number }) {
  const [open, setOpen] = useState(false);

  const hasDetails = ep.intrigueA || ep.intrigueB || ep.midpoint || ep.climax ||
    ep.humourOrganique || ep.momentDePleur || ep.keyReveal || ep.toneNote || ep.lienArcSaison;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="bg-background/30 border-border/30 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-primary w-12 text-center py-1.5 rounded bg-primary/10 shrink-0">
              ÉP {ep.number}
            </span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{ep.title}</CardTitle>
              {ep.logline && <p className="text-xs text-primary/70 italic mt-0.5 truncate">{ep.logline}</p>}
            </div>
            {hasDetails && (
              <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">

          {ep.questionDramatique && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2">
              <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider mb-1">Question dramatique</p>
              <p className="text-xs text-foreground/80 italic">{ep.questionDramatique}</p>
            </div>
          )}

          <p className="text-sm text-foreground/80 leading-relaxed">{ep.summary}</p>

          {ep.openingScene && (
            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 italic">{ep.openingScene}</p>
          )}

          {ep.emotionalEvolution && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">Arc émotionnel</span>
              <span className="text-xs text-foreground/70 italic">{ep.emotionalEvolution}</span>
            </div>
          )}

          {/* Expandable detail */}
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 pt-2 border-t border-border/30 overflow-hidden"
            >
              {ep.intrigueA && (
                <div>
                  <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">Intrigue A</p>
                  <p className="text-xs text-foreground/70">{ep.intrigueA}</p>
                </div>
              )}
              {ep.intrigueB && (
                <div>
                  <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-1">Intrigue B</p>
                  <p className="text-xs text-foreground/70">{ep.intrigueB}</p>
                </div>
              )}
              {ep.midpoint && (
                <div className="bg-background/40 rounded p-2">
                  <p className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider mb-1">Point médian</p>
                  <p className="text-xs text-foreground/70">{ep.midpoint}</p>
                </div>
              )}
              {ep.climax && (
                <div className="bg-background/40 rounded p-2">
                  <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-1">Climax</p>
                  <p className="text-xs text-foreground/70">{ep.climax}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {ep.humourOrganique && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-2">
                    <p className="text-[10px] text-yellow-400 font-semibold mb-1">😄 Humour organique</p>
                    <p className="text-xs text-foreground/70">{ep.humourOrganique}</p>
                  </div>
                )}
                {ep.momentDePleur && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded p-2">
                    <p className="text-[10px] text-blue-400 font-semibold mb-1">💧 Moment de pleur</p>
                    <p className="text-xs text-foreground/70">{ep.momentDePleur}</p>
                  </div>
                )}
              </div>
              {ep.keyReveal && (
                <div className="bg-background/40 rounded p-2">
                  <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider mb-1">Révélation clé</p>
                  <p className="text-xs text-foreground/70">{ep.keyReveal}</p>
                </div>
              )}
              {ep.toneNote && (
                <p className="text-xs text-muted-foreground italic">{ep.toneNote}</p>
              )}
              {ep.lienArcSaison && (
                <div className="bg-primary/5 border border-primary/20 rounded p-2">
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">Lien arc saison</p>
                  <p className="text-xs text-foreground/70">{ep.lienArcSaison}</p>
                </div>
              )}
            </motion.div>
          )}

          {ep.cliffhanger && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1">⚡ Cliffhanger</p>
              <p className="text-xs text-foreground/70">{ep.cliffhanger}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: series, isLoading } = useGetSeries(id!, {
    query: { enabled: !!id, queryKey: getGetSeriesQueryKey(id!) }
  });
  const generate = useGenerateSeries();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSeriesQueryKey(id!) });
        toast({ title: "Série générée" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!series) return (
    <AppLayout>
      <GenerateEmptyState
        title="Atelier Série"
        description="Développez votre projet en série : bible complète, concept de saison, épisodes avec toutes leurs intrigues, arcs longs, révélations progressives et personnages secondaires."
        buttonLabel="Générer la bible série"
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const episodes = (series.episodes ?? []) as unknown as SeriesEpisode[];
  const longArcs = series.longArcs ?? [];
  const progressiveRevs = series.progressiveRevelations ?? [];
  const secondaryChars = series.secondaryCharacters ?? [];

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Atelier Série</h1>
            <p className="text-muted-foreground mt-1">{series.format}</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        {/* Logline série */}
        {(series as unknown as Record<string, string>).loglineSerie && (
          <div className="px-5 py-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary/70 uppercase tracking-wider font-semibold mb-1.5">Logline série</p>
            <p className="text-sm text-foreground/90 italic leading-relaxed">{(series as unknown as Record<string, string>).loglineSerie}</p>
          </div>
        )}

        <SectionCard title="Concept de saison" icon={<Tv className="w-4 h-4 text-primary" />}>
          <p className="text-sm text-foreground/80 leading-relaxed">{series.seasonConcept}</p>
          {(series as unknown as Record<string, string>).seriesPotential && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Potentiel série</p>
              <p className="text-sm text-foreground/70">{(series as unknown as Record<string, string>).seriesPotential}</p>
            </div>
          )}
        </SectionCard>

        {longArcs.length > 0 && (
          <SectionCard title="Arcs longs">
            <div className="space-y-2">
              {longArcs.map((arc, i) => {
                if (typeof arc === "string") {
                  return <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-primary/30">{arc}</p>;
                }
                const a = arc as { label: string; description: string };
                return (
                  <div key={i} className="pl-3 border-l-2 border-primary/30">
                    <p className="text-sm font-medium text-primary/80">{a.label}</p>
                    {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        <SectionCard title={`Épisodes (${episodes.length})`}>
          <div className="space-y-3">
            {episodes.map((ep, i) => (
              <EpisodeCard key={i} ep={ep} index={i} />
            ))}
          </div>
        </SectionCard>

        {progressiveRevs.length > 0 && (
          <SectionCard title="Révélations progressives">
            <div className="space-y-2">
              {progressiveRevs.map((rev, i) => {
                if (typeof rev === "string") {
                  return <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-cyan-500/30">→ {rev}</p>;
                }
                const r = rev as { episode: number; revelation: string };
                return (
                  <div key={i} className="flex gap-3 items-start pl-3 border-l-2 border-cyan-500/30">
                    {r.episode && <span className="text-xs font-bold text-cyan-400 shrink-0">ÉP {r.episode}</span>}
                    <p className="text-sm text-foreground/80">→ {r.revelation}</p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {secondaryChars.length > 0 && (
          <SectionCard title="Personnages secondaires">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {secondaryChars.map((char, i) => {
                if (typeof char === "string") {
                  return <p key={i} className="text-sm text-foreground/80 pl-3 border-l border-border/40">· {char}</p>;
                }
                const c = char as { name: string; role: string; arc: string };
                return (
                  <div key={i} className="p-3 rounded-lg bg-background/30 border border-border/30">
                    <p className="text-sm font-medium">{c.name}</p>
                    {c.role && <p className="text-xs text-primary/70 italic">{c.role}</p>}
                    {c.arc && <p className="text-xs text-muted-foreground mt-1">{c.arc}</p>}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}
