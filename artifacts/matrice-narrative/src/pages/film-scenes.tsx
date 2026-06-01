import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, RefreshCw, ChevronDown, ChevronUp, Camera, Film, Zap, Users, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { motion } from "framer-motion";
import { useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type FilmScene = {
  id: string;
  projectId: string;
  sceneNumber: number;
  title: string;
  intExt?: string;
  location?: string;
  timeOfDay?: string;
  charactersPresent?: string[];
  protagonistObjective?: string;
  obstacle?: string;
  visibleConflict?: string;
  emotionalSubtext?: string;
  openingBeat?: string;
  dramaticTurn?: string;
  closingBeat?: string;
  emotionBefore?: string;
  emotionAfter?: string;
  strongImage?: string;
  soundOrSilence?: string;
  symbolicObject?: string;
  actionDescription?: string;
  dialogueFragment?: string;
  narrativeFunction?: string;
  suspenseLevel?: number;
  humourLevel?: number;
  emotionalPowerLevel?: number;
  attractivenessLevel?: number;
  hpsaCheck?: Record<string, number>;
  linkToEmotionalCore?: string;
  directorNote?: string;
  cameraSuggestion?: string;
  riskOfCliche?: string;
  originalAlternative?: string;
};

const FUNCTION_COLORS: Record<string, string> = {
  Exposition: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Complication: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Révélation: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Climax: "bg-red-500/15 text-red-400 border-red-500/30",
  Résolution: "bg-green-500/15 text-green-400 border-green-500/30",
  Confrontation: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Transition: "bg-muted/50 text-muted-foreground border-border/30",
};

function getFunctionColor(fn?: string) {
  if (!fn) return "bg-muted/50 text-muted-foreground border-border/30";
  for (const [key, val] of Object.entries(FUNCTION_COLORS)) {
    if (fn.includes(key)) return val;
  }
  return "bg-primary/10 text-primary/80 border-primary/20";
}

function HpsaMini({ hpsa }: { hpsa: Record<string, number> }) {
  const axes = [
    { key: "humour", emoji: "😄", color: "bg-yellow-500" },
    { key: "pleur", emoji: "💧", color: "bg-blue-500" },
    { key: "suspense", emoji: "⚡", color: "bg-red-500" },
    { key: "attractivite", emoji: "✨", color: "bg-pink-500" },
  ];
  return (
    <div className="grid grid-cols-4 gap-1">
      {axes.map(a => (
        <div key={a.key} className="text-center">
          <span className="text-[10px]">{a.emoji}</span>
          <div className="h-1 bg-secondary rounded-full overflow-hidden mt-0.5">
            <div className={`h-full rounded-full ${a.color}`} style={{ width: `${hpsa[a.key] ?? 0}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground">{hpsa[a.key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

function SceneCard({ scene, index }: { scene: FilmScene; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="bg-card/50 border-border/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <span className="text-xs font-bold text-primary min-w-[2.5rem] text-center py-1.5 rounded-lg bg-primary/10 shrink-0">
              S{scene.sceneNumber}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm font-semibold">{scene.title}</CardTitle>
                {scene.narrativeFunction && (
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${getFunctionColor(scene.narrativeFunction)}`}>
                    {scene.narrativeFunction}
                  </span>
                )}
              </div>
              {(scene.intExt || scene.location || scene.timeOfDay) && (
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono uppercase tracking-wider">
                  {[scene.intExt, scene.location, scene.timeOfDay].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>
            <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Characters + emotion flow */}
          <div className="flex items-center gap-3 flex-wrap">
            {scene.charactersPresent && scene.charactersPresent.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground">{scene.charactersPresent.join(", ")}</span>
              </div>
            )}
            {(scene.emotionBefore || scene.emotionAfter) && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground/60">{scene.emotionBefore}</span>
                <span className="text-primary/50 mx-1">→</span>
                <span className="text-primary/80 font-medium">{scene.emotionAfter}</span>
              </div>
            )}
          </div>

          {/* Action */}
          {scene.actionDescription && (
            <p className="text-sm text-foreground/80 leading-relaxed">{scene.actionDescription}</p>
          )}

          {/* HPSA mini */}
          {scene.hpsaCheck && Object.keys(scene.hpsaCheck).length > 0 && (
            <HpsaMini hpsa={scene.hpsaCheck} />
          )}

          {/* Expandable details */}
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2 border-t border-border/30">

              {/* Objective + obstacle */}
              {(scene.protagonistObjective || scene.obstacle) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scene.protagonistObjective && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                      <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">Objectif</p>
                      <p className="text-xs text-foreground/70">{scene.protagonistObjective}</p>
                    </div>
                  )}
                  {scene.obstacle && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                      <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-1">Obstacle</p>
                      <p className="text-xs text-foreground/70">{scene.obstacle}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Beat structure */}
              {(scene.openingBeat || scene.dramaticTurn || scene.closingBeat) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Structure de la scène</p>
                  <div className="space-y-1">
                    {scene.openingBeat && (
                      <div className="flex gap-2">
                        <span className="text-[9px] text-green-400 font-bold uppercase w-12 shrink-0 pt-0.5">DÉBUT</span>
                        <p className="text-xs text-foreground/70">{scene.openingBeat}</p>
                      </div>
                    )}
                    {scene.dramaticTurn && (
                      <div className="flex gap-2">
                        <span className="text-[9px] text-yellow-400 font-bold uppercase w-12 shrink-0 pt-0.5">PIVOT</span>
                        <p className="text-xs text-foreground/70">{scene.dramaticTurn}</p>
                      </div>
                    )}
                    {scene.closingBeat && (
                      <div className="flex gap-2">
                        <span className="text-[9px] text-red-400 font-bold uppercase w-12 shrink-0 pt-0.5">FIN</span>
                        <p className="text-xs text-foreground/70">{scene.closingBeat}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subtext + conflict */}
              {scene.emotionalSubtext && (
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-2.5">
                  <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider mb-1">Sous-texte émotionnel</p>
                  <p className="text-xs text-foreground/70 italic">{scene.emotionalSubtext}</p>
                </div>
              )}

              {/* Dialogue */}
              {scene.dialogueFragment && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Fragment de dialogue</p>
                  <pre className="text-xs text-foreground/70 font-mono whitespace-pre-wrap bg-background/30 rounded p-2.5 border border-border/30">
                    {scene.dialogueFragment}
                  </pre>
                </div>
              )}

              {/* Strong image + sound */}
              {(scene.strongImage || scene.soundOrSilence || scene.symbolicObject) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {scene.strongImage && (
                    <div className="bg-background/30 rounded p-2">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase mb-1">Image forte</p>
                      <p className="text-xs text-foreground/70 italic">{scene.strongImage}</p>
                    </div>
                  )}
                  {scene.soundOrSilence && (
                    <div className="bg-background/30 rounded p-2">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase mb-1">Son / Silence</p>
                      <p className="text-xs text-foreground/70 italic">{scene.soundOrSilence}</p>
                    </div>
                  )}
                  {scene.symbolicObject && (
                    <div className="bg-background/30 rounded p-2">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase mb-1">Objet symbolique</p>
                      <p className="text-xs text-foreground/70 italic">{scene.symbolicObject}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Director note + camera */}
              {(scene.directorNote || scene.cameraSuggestion) && (
                <div className="flex gap-2 flex-wrap">
                  {scene.cameraSuggestion && (
                    <div className="flex items-center gap-1.5 bg-background/30 rounded-lg px-2.5 py-1.5">
                      <Camera className="w-3 h-3 text-primary/60" />
                      <span className="text-xs text-muted-foreground">{scene.cameraSuggestion}</span>
                    </div>
                  )}
                  {scene.directorNote && (
                    <div className="flex items-center gap-1.5 bg-background/30 rounded-lg px-2.5 py-1.5">
                      <Film className="w-3 h-3 text-primary/60" />
                      <span className="text-xs text-muted-foreground">{scene.directorNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Link to emotional core */}
              {scene.linkToEmotionalCore && (
                <p className="text-xs text-violet-400/80 italic border-l-2 border-violet-500/30 pl-2">
                  ↳ {scene.linkToEmotionalCore}
                </p>
              )}

              {/* Cliché risk + original alternative */}
              {(scene.riskOfCliche || scene.originalAlternative) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scene.riskOfCliche && (
                    <div className="flex gap-2 bg-orange-500/5 border border-orange-500/20 rounded-lg p-2.5">
                      <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] text-orange-400 font-semibold uppercase mb-1">Risque cliché</p>
                        <p className="text-xs text-foreground/70">{scene.riskOfCliche}</p>
                      </div>
                    </div>
                  )}
                  {scene.originalAlternative && (
                    <div className="flex gap-2 bg-green-500/5 border border-green-500/20 rounded-lg p-2.5">
                      <Lightbulb className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] text-green-400 font-semibold uppercase mb-1">Alternative originale</p>
                        <p className="text-xs text-foreground/70">{scene.originalAlternative}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FilmScenesPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: scenes = [], isLoading } = useQuery<FilmScene[]>({
    queryKey: [`/api/projects/${id}/film-scenes`],
    queryFn: () => apiFetch(`${BASE}/api/projects/${id}/film-scenes`).then(r => r.json()) as Promise<FilmScene[]>,
    enabled: !!id,
  });

  const generate = useMutation({
    mutationFn: () => apiFetch(`${BASE}/api/projects/${id}/generate-film-scenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(async r => {
      if (!r.ok) throw new Error("Erreur");
      const text = await r.text();
      const lines = text.split("\n").filter(l => l.startsWith("data:"));
      const lastData = lines[lines.length - 1]?.replace("data:", "").trim();
      return lastData ? JSON.parse(lastData) : null;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/film-scenes`] });
      toast({ title: "Scènes jouables générées" });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur de génération" }),
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  );

  if (scenes.length === 0) return (
    <AppLayout>
      <GenerateEmptyState
        title="Scènes Jouables"
        description="Génère 10 scènes clés entièrement développées : structure dramatique complète, sous-texte émotionnel, fragments de dialogue, notes de mise en scène, analyse H.P.S.A. par scène et alternatives originales."
        buttonLabel="Générer les scènes jouables"
        onGenerate={() => generate.mutate()}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const avgHpsa = scenes.reduce((acc, s) => {
    const h = s.hpsaCheck ?? {};
    return {
      humour: acc.humour + (h.humour ?? 0),
      pleur: acc.pleur + (h.pleur ?? 0),
      suspense: acc.suspense + (h.suspense ?? 0),
      attractivite: acc.attractivite + (h.attractivite ?? 0),
    };
  }, { humour: 0, pleur: 0, suspense: 0, attractivite: 0 });
  const n = Math.max(1, scenes.length);
  const avg = {
    humour: Math.round(avgHpsa.humour / n),
    pleur: Math.round(avgHpsa.pleur / n),
    suspense: Math.round(avgHpsa.suspense / n),
    attractivite: Math.round(avgHpsa.attractivite / n),
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Scènes Jouables</h1>
            <p className="text-muted-foreground mt-1">{scenes.length} scènes · Analyse dramaturgique complète</p>
          </div>
          <Button onClick={() => generate.mutate()} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        {/* Global HPSA overview */}
        <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Score H.P.S.A. moyen — {scenes.length} scènes
            </p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { key: "humour", emoji: "😄", label: "Humour", color: "bg-yellow-500" },
                { key: "pleur", emoji: "💧", label: "Pleur", color: "bg-blue-500" },
                { key: "suspense", emoji: "⚡", label: "Suspense", color: "bg-red-500" },
                { key: "attractivite", emoji: "✨", label: "Attract.", color: "bg-pink-500" },
              ].map(a => (
                <div key={a.key} className="text-center">
                  <span className="text-lg">{a.emoji}</span>
                  <p className="text-xl font-bold font-serif mt-1">{avg[a.key as keyof typeof avg]}</p>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                    <div className={`h-full rounded-full ${a.color}`} style={{ width: `${avg[a.key as keyof typeof avg]}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scene cards */}
        <div className="space-y-3">
          {scenes.map((scene, i) => (
            <SceneCard key={scene.id} scene={scene} index={i} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
