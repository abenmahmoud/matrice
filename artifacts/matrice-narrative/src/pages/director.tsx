import { useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Clapperboard, Camera, Sun, Music2, Scissors, Eye,
  ChevronRight, Film, SlidersHorizontal, Lightbulb, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Shot = {
  index: number;
  excerpt: string;
  planType: string;
  cameraMovement: string;
  lens: string;
  lighting: string;
  soundDesign: string;
  editingRhythm: string;
  mood: string;
  directorNote: string;
};

type DirectorBreakdown = {
  sceneTitle: string;
  overallMood: string;
  colorGrading: string;
  productionNote: string;
  shots: Shot[];
};

const SHOT_ATTRS: { key: keyof Shot; label: string; icon: React.ElementType; color: string }[] = [
  { key: "planType", label: "Type de plan", icon: Film, color: "text-violet-400" },
  { key: "cameraMovement", label: "Mouvement caméra", icon: Camera, color: "text-indigo-400" },
  { key: "lens", label: "Focale", icon: SlidersHorizontal, color: "text-blue-400" },
  { key: "lighting", label: "Lumière", icon: Sun, color: "text-amber-400" },
  { key: "soundDesign", label: "Son & ambiance", icon: Music2, color: "text-emerald-400" },
  { key: "editingRhythm", label: "Montage", icon: Scissors, color: "text-rose-400" },
  { key: "mood", label: "Émotion visée", icon: Eye, color: "text-pink-400" },
  { key: "directorNote", label: "Note du réalisateur", icon: Lightbulb, color: "text-yellow-400" },
];

const EXAMPLES = [
  "Elle ouvrit la porte lentement. La chambre était plongée dans le noir, à l'exception d'un filet de lumière qui glissait sous les rideaux fermés. Elle retint sa respiration et fit un pas en avant.",
  "Il la regarda traverser la place sans se retourner. La foule s'ouvrait autour d'elle comme si elle portait quelque chose d'invisible. Il savait qu'il ne la reverrait plus jamais.",
  "Le moteur toussa une dernière fois avant de s'éteindre. La route s'étirait devant eux, droite et vide, jusqu'à l'horizon. Personne ne dit rien pendant longtemps.",
];

export default function DirectorPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [passage, setPassage] = useState("");
  const [result, setResult] = useState<DirectorBreakdown | null>(null);
  const [expandedShot, setExpandedShot] = useState<number | null>(0);

  const analyze = useMutation({
    mutationFn: async () => {
      const r = await apiFetch(`${BASE}/api/projects/${id}/director-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Erreur serveur");
      }
      return r.json() as Promise<DirectorBreakdown>;
    },
    onSuccess: (data) => {
      setResult(data);
      setExpandedShot(0);
      toast({ title: "Découpe réalisée", description: `${data.shots.length} plan${data.shots.length > 1 ? "s" : ""} analysé${data.shots.length > 1 ? "s" : ""}` });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const charCount = passage.length;
  const canSubmit = charCount >= 20 && !analyze.isPending;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#09090e]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Clapperboard className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h1 className="text-base font-bold">Mode Réalisateur</h1>
                <p className="text-[11px] text-muted-foreground">Découpe technique de mise en scène par l'IA</p>
              </div>
            </div>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { setResult(null); setPassage(""); }}
                className="text-xs gap-1.5 border-white/10">
                <RefreshCw className="w-3 h-3" /> Nouveau passage
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">

          {/* Input Zone — always visible before result */}
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="space-y-6">

                <div className="p-6 rounded-2xl bg-[#0d0b14] border border-white/[0.06] space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Film className="w-4 h-4 text-violet-400" />
                    <p className="text-sm font-semibold">Collez un passage à mettre en scène</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Une scène, un moment, une description narrative — l'IA le découpe en plans techniques
                    avec cadrage, lumière, son, rythme et intention de réalisateur.
                  </p>
                  <Textarea
                    value={passage}
                    onChange={e => setPassage(e.target.value)}
                    placeholder="Collez ici un extrait de votre œuvre — roman, scénario, traitement..."
                    className="min-h-[200px] bg-[#09090e] border-white/[0.08] text-sm leading-relaxed resize-none focus-visible:ring-violet-500/40 placeholder:text-white/15"
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${charCount < 20 ? "text-white/20" : "text-white/30"}`}>
                      {charCount} caractères{charCount < 20 ? ` — minimum 20` : ""}
                    </span>
                    <Button onClick={() => analyze.mutate()} disabled={!canSubmit} size="lg"
                      className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-8 gap-2">
                      {analyze.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...</>
                        : <><Clapperboard className="w-4 h-4" /> Découper la scène</>
                      }
                    </Button>
                  </div>
                </div>

                {/* Example passages */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Exemples pour tester</p>
                  <div className="space-y-2">
                    {EXAMPLES.map((ex, i) => (
                      <button key={i} onClick={() => setPassage(ex)}
                        className="w-full text-left p-3 rounded-xl bg-[#0d0b14] border border-white/[0.05] hover:border-violet-500/30 transition-colors group">
                        <p className="text-xs text-white/35 group-hover:text-white/55 leading-relaxed line-clamp-2 italic">
                          « {ex} »
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-8">

                {/* Scene header card */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0d0b14] border border-violet-500/20 p-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Clapperboard className="w-4 h-4 text-violet-400" />
                      <span className="text-[10px] uppercase tracking-widest text-violet-400/60 font-semibold">Scène analysée</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold mb-2">{result.sceneTitle}</h2>
                    <p className="text-sm text-white/50 italic mb-5">{result.overallMood}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-2">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Étalonnage couleur</p>
                        </div>
                        <p className="text-xs text-white/55 leading-relaxed">{result.colorGrading}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Note de production</p>
                        </div>
                        <p className="text-xs text-white/55 leading-relaxed">{result.productionNote}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shot strip */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">
                    {result.shots.length} plan{result.shots.length > 1 ? "s" : ""} — cliquez pour développer
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {result.shots.map((shot, i) => (
                      <button key={i} onClick={() => setExpandedShot(expandedShot === i ? null : i)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          expandedShot === i
                            ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                            : "bg-[#0d0b14] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10"
                        }`}>
                        Plan {shot.index}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shot cards */}
                <div className="space-y-3">
                  {result.shots.map((shot, i) => (
                    <motion.div key={i} layout className="rounded-2xl bg-[#0d0b14] border border-white/[0.06] overflow-hidden">
                      {/* Shot header — always visible */}
                      <button
                        onClick={() => setExpandedShot(expandedShot === i ? null : i)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-violet-400">{shot.index}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate">{shot.planType}</p>
                          <p className="text-[11px] text-white/30 truncate italic mt-0.5">« {shot.excerpt} »</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-[10px] text-violet-300/60 hidden sm:block">{shot.mood}</span>
                          <ChevronRight className={`w-4 h-4 text-white/20 transition-transform ${expandedShot === i ? "rotate-90" : ""}`} />
                        </div>
                      </button>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {expandedShot === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="px-4 pb-5 pt-1 border-t border-white/[0.04]">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                {SHOT_ATTRS.map(({ key, label, icon: Icon, color }) => (
                                  <div key={key} className="flex gap-3 p-3 rounded-xl bg-[#09090e] border border-white/[0.04]">
                                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${color}`} />
                                    <div className="min-w-0">
                                      <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold mb-1">{label}</p>
                                      <p className="text-xs text-white/60 leading-relaxed">{String(shot[key])}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Passage used */}
                <div className="p-4 rounded-xl bg-[#0d0b14] border border-white/[0.05]">
                  <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Passage analysé</p>
                  <p className="text-xs text-white/25 italic leading-relaxed line-clamp-4">« {passage} »</p>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
