import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BarChart2, Smile, Zap, Heart, Feather, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Pilier = {
  name: string;
  presence: number;
  type: string;
  analysis: string;
  strongMoment: string;
  artisticSuggestion: string;
};

type PiliersData = {
  pillars: Pilier[];
  dominantPillar: string;
  weakestPillar: string;
  globalBalance: string;
};

const PILIER_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; barColor: string }> = {
  "Humour":    { icon: Smile,   color: "text-yellow-400",  bg: "bg-yellow-600/10",  border: "border-yellow-500/20", barColor: "bg-yellow-500" },
  "Suspense":  { icon: Zap,     color: "text-violet-400",  bg: "bg-violet-600/10",  border: "border-violet-500/20", barColor: "bg-violet-500" },
  "Émotion":   { icon: Heart,   color: "text-rose-400",    bg: "bg-rose-600/10",    border: "border-rose-500/20",   barColor: "bg-rose-500" },
  "Tendresse": { icon: Feather, color: "text-sky-400",     bg: "bg-sky-600/10",     border: "border-sky-500/20",    barColor: "bg-sky-500" },
  "Surprise":  { icon: Star,    color: "text-amber-400",   bg: "bg-amber-600/10",   border: "border-amber-500/20",  barColor: "bg-amber-500" },
};

const DEFAULT_CONFIG = { icon: BarChart2, color: "text-white/60", bg: "bg-white/5", border: "border-white/10", barColor: "bg-white/40" };

function PresenceBar({ value, barColor }: { value: number; barColor: string }) {
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className={`h-full rounded-full ${barColor}`}
      />
    </div>
  );
}

export default function PiliersPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<number | null>(null);

  const { data, isLoading } = useQuery<PiliersData>({
    queryKey: [`/api/projects/${id}/cinq-piliers`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/cinq-piliers`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<PiliersData>;
    }),
    enabled: !!id, retry: false,
  });

  const generate = useMutation({
    mutationFn: () => fetch(`${BASE}/api/projects/${id}/generate-cinq-piliers`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/cinq-piliers`] });
      setSelected(null);
      toast({ title: "Piliers analysés", description: "L'équilibre dramatique de votre œuvre est prêt." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible d'analyser les piliers." }),
  });

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <BarChart2 className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Les 5 Piliers</h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Humour, Suspense, Émotion, Tendresse, Surprise — les cinq forces qui font qu'une histoire 
            touche vraiment les gens. L'IA analyse leur présence et leur équilibre dans votre œuvre.
          </p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Analyser les piliers
        </Button>
      </div>
    </AppLayout>
  );

  const activePilier = selected !== null ? data.pillars[selected] : null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Header */}
        <div className="border-b border-white/[0.05] bg-[#0d0b14]">
          <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <BarChart2 className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] uppercase tracking-widest text-violet-400/60 font-semibold">Équilibre Dramatique</span>
              </div>
              <h1 className="text-xl font-serif font-bold">Les 5 Piliers</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}
              className="text-xs border-white/10">
              {generate.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
              Régénérer
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Radar / Bar overview */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
            {data.pillars.map((pilier, i) => {
              const cfg = PILIER_CONFIG[pilier.name] ?? DEFAULT_CONFIG;
              const Icon = cfg.icon;
              const isSelected = selected === i;
              return (
                <button key={i} onClick={() => setSelected(isSelected ? null : i)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected ? `${cfg.bg} ${cfg.border}` : "bg-[#0d0b14] border-white/[0.06] hover:border-white/10"
                  }`}>
                  <Icon className={`w-5 h-5 mb-2 ${cfg.color}`} />
                  <p className="text-xs font-bold text-white/80 mb-2">{pilier.name}</p>
                  <PresenceBar value={pilier.presence} barColor={cfg.barColor} />
                  <p className={`text-lg font-bold mt-2 ${cfg.color}`}>{pilier.presence}<span className="text-xs font-normal text-white/30">%</span></p>
                </button>
              );
            })}
          </motion.div>

          {/* Selected pilier detail */}
          {activePilier && (() => {
            const cfg = PILIER_CONFIG[activePilier.name] ?? DEFAULT_CONFIG;
            const Icon = cfg.icon;
            return (
              <motion.div key={activePilier.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl ${cfg.bg} ${cfg.border} border mb-8 space-y-4`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                  <h2 className="text-base font-bold">{activePilier.name}</h2>
                  <span className={`text-sm font-bold ml-auto ${cfg.color}`}>{activePilier.presence}%</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Type présent", value: activePilier.type },
                    { label: "Moment fort", value: activePilier.strongMoment },
                    { label: "Analyse", value: activePilier.analysis },
                    { label: "Invitation artistique", value: activePilier.artisticSuggestion },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-xl bg-black/20">
                      <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold mb-1.5">{item.label}</p>
                      <p className="text-sm text-white/60 leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}

          {/* Global balance */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl bg-[#0d0b14] border border-white/[0.06] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">Équilibre Global</h2>
            <p className="text-sm text-white/60 leading-relaxed">{data.globalBalance}</p>
            <div className="flex gap-6 pt-2">
              {[
                { label: "Pilier dominant", value: data.dominantPillar, color: "text-emerald-400" },
                { label: "À approfondir", value: data.weakestPillar, color: "text-amber-400" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold mb-1">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
