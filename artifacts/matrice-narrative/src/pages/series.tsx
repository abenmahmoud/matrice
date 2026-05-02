import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetSeries, useGenerateSeries, getGetSeriesQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Tv } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { motion } from "framer-motion";

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
        description="Développez votre projet en série : format, concept de saison, épisodes, arcs longs et cliffhangers."
        buttonLabel="Générer la structure série"
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

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

        <SectionCard title="Concept de saison" icon={<Tv className="w-4 h-4 text-primary" />}>
          <p className="text-sm text-foreground/80 leading-relaxed">{series.seasonConcept}</p>
        </SectionCard>

        {series.longArcs && series.longArcs.length > 0 && (
          <SectionCard title="Arcs longs">
            {series.longArcs.map((arc, i) => (
              <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-primary/30">{arc}</p>
            ))}
          </SectionCard>
        )}

        <SectionCard title="Épisodes">
          <div className="space-y-3">
            {series.episodes?.map((ep, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="bg-background/30 border-border/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary w-10 text-center py-1 rounded bg-primary/10">EP {ep.number}</span>
                      <CardTitle className="text-sm font-semibold">{ep.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-foreground/80">{ep.summary}</p>
                    {ep.emotionalEvolution && (
                      <p className="text-xs text-muted-foreground italic">Arc émotionnel : {ep.emotionalEvolution}</p>
                    )}
                    {ep.cliffhanger && (
                      <div className="mt-2 pt-2 border-t border-border/20">
                        <p className="text-xs font-medium text-yellow-400 mb-1">Cliffhanger</p>
                        <p className="text-xs text-foreground/70">{ep.cliffhanger}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        {series.progressiveRevelations && series.progressiveRevelations.length > 0 && (
          <SectionCard title="Révélations progressives">
            {series.progressiveRevelations.map((r, i) => (
              <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-2/30">{r}</p>
            ))}
          </SectionCard>
        )}

        {series.secondaryCharacters && series.secondaryCharacters.length > 0 && (
          <SectionCard title="Personnages secondaires">
            <div className="flex flex-wrap gap-2">
              {series.secondaryCharacters.map((c, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">{c}</span>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}
