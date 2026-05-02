import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetScreenplay, useGenerateScreenplay, getGetScreenplayQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { motion } from "framer-motion";

export default function ScreenplayPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: sp, isLoading } = useGetScreenplay(id!, {
    query: { enabled: !!id, queryKey: getGetScreenplayQueryKey(id!) }
  });
  const generate = useGenerateScreenplay();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetScreenplayQueryKey(id!) });
        toast({ title: "Scénario généré" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!sp) return (
    <AppLayout>
      <GenerateEmptyState
        title="Atelier Scénario"
        description="Générez la structure cinématographique complète : logline, 15 grands beats, scènes et le scénario au format Fountain."
        buttonLabel="Générer le scénario"
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
            <h1 className="text-3xl font-serif font-bold">Atelier Scénario</h1>
            <p className="text-muted-foreground mt-1">Structure cinématographique de votre projet</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="beats">15 Beats</TabsTrigger>
            <TabsTrigger value="scenes">Scènes</TabsTrigger>
            <TabsTrigger value="fountain">Script Fountain</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <SectionCard title="Logline">
              <p className="text-base font-medium leading-relaxed">{sp.logline}</p>
            </SectionCard>
            <SectionCard title="Synopsis cinématographique">
              <p className="text-sm text-foreground/80 leading-relaxed">{sp.cinematicSynopsis}</p>
            </SectionCard>
            {sp.treatment && (
              <SectionCard title="Traitement">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{sp.treatment}</p>
              </SectionCard>
            )}
          </TabsContent>

          <TabsContent value="beats" className="mt-4">
            <div className="space-y-3">
              {sp.beats?.map((beat, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="flex gap-4 p-4 rounded-lg border border-border/40 bg-card/30">
                    <span className="text-xs font-bold text-primary w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">{beat.number}</span>
                    <p className="text-sm text-foreground/80 leading-relaxed">{beat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scenes" className="mt-4 space-y-4">
            {sp.scenes?.map((scene, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4">
                    <div className="font-mono text-sm text-primary font-bold mb-2">INT./EXT. — SCÈNE {scene.number}</div>
                    <div className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">{scene.heading}</div>
                    <p className="text-sm text-foreground/80 mb-3">{scene.description}</p>
                    {scene.dialogueDraft && (
                      <pre className="font-mono text-xs text-foreground/70 bg-background/30 rounded p-3 whitespace-pre-wrap border border-border/30">{scene.dialogueDraft}</pre>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="fountain" className="mt-4">
            <Card className="bg-background/50 border-border/50">
              <CardContent className="pt-4">
                <pre className="font-mono text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[600px]">{sp.fountainScript}</pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
