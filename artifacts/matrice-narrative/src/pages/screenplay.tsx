import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetScreenplay, useGenerateScreenplay, getGetScreenplayQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Film, Wand2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Beat = { number: number; label?: string; description: string; pageRange?: string };
type SceneItem = { number: number; heading: string; description: string; dialogueDraft?: string; emotionalTone?: string; dramaticFunction?: string };

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
        description="Générez la structure cinématographique complète : logline, tagline, 15 grands beats avec labels, scènes avec ton émotionnel et fonction dramatique, et le script au format Fountain professionnel."
        buttonLabel="Générer le scénario"
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const beats = (sp.beats ?? []) as unknown as Beat[];
  const scenes = (sp.scenes ?? []) as unknown as SceneItem[];
  const tagline = (sp as unknown as Record<string, string>).tagline;

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

        {tagline && (
          <div className="px-5 py-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-lg font-serif italic text-primary/90">&ldquo;{tagline}&rdquo;</p>
          </div>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="bg-card/50 border border-border/50 flex-wrap h-auto gap-0.5 p-1">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="beats">15 Beats</TabsTrigger>
            <TabsTrigger value="scenes">Scènes</TabsTrigger>
            <TabsTrigger value="fountain">Script Fountain</TabsTrigger>
            <TabsTrigger value="film-studio" className="text-primary/80">
              <Wand2 className="w-3.5 h-3.5 mr-1" />
              Atelier Film
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
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

          {/* 15 Beats */}
          <TabsContent value="beats" className="mt-4">
            <div className="space-y-2">
              {beats.map((beat, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="flex gap-4 p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/40 transition-colors">
                    <div className="shrink-0">
                      <span className="text-xs font-bold text-primary w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {beat.number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {beat.label && (
                        <p className="text-[11px] font-bold text-primary/70 uppercase tracking-widest mb-1">{beat.label}</p>
                      )}
                      <p className="text-sm text-foreground/80 leading-relaxed">{beat.description}</p>
                      {beat.pageRange && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">{beat.pageRange}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Scenes */}
          <TabsContent value="scenes" className="mt-4 space-y-4">
            {scenes.map((scene, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs text-primary font-bold mb-0.5 uppercase tracking-wider">{scene.heading}</div>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {scene.dramaticFunction && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold uppercase tracking-wide">
                              {scene.dramaticFunction}
                            </span>
                          )}
                          {scene.emotionalTone && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 italic">
                              {scene.emotionalTone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary/40 shrink-0">#{scene.number}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 mb-3">{scene.description}</p>
                    {scene.dialogueDraft && (
                      <pre className="font-mono text-xs text-foreground/70 bg-background/30 rounded p-3 whitespace-pre-wrap border border-border/30">
                        {scene.dialogueDraft}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Fountain script */}
          <TabsContent value="fountain" className="mt-4">
            <Card className="bg-background/50 border-border/50">
              <CardContent className="pt-4">
                <pre className="font-mono text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[600px]">
                  {sp.fountainScript}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atelier Film */}
          <TabsContent value="film-studio" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
                onClick={() => { window.location.href = `${BASE}/matrice-narrative/projects/${id}/film-scenes`; }}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Scènes Jouables</CardTitle>
                      <p className="text-[11px] text-muted-foreground">10 scènes dramaturgiques complètes</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    Génère 10 scènes clés avec structure complète : objectif, obstacle, sous-texte, dialogue, notes de mise en scène et analyse H.P.S.A.
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-primary/70 group-hover:text-primary transition-colors">
                    <span>Accéder aux scènes jouables</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/30">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                      <Film className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-muted-foreground">Découpage Technique</CardTitle>
                      <p className="text-[11px] text-muted-foreground/60">Prochainement</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    Plan de tournage, découpage plan par plan, feuilles de service et raccords de montage.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/30">
              <CardContent className="pt-6 pb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Structure rapide</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Beats", count: beats.length, color: "text-primary" },
                    { label: "Scènes", count: scenes.length, color: "text-blue-400" },
                    { label: "Pages estimées", count: `~${scenes.length * 2}`, color: "text-violet-400" },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="text-center py-3 bg-background/30 rounded-lg">
                      <p className={`text-2xl font-bold font-serif ${color}`}>{count}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
