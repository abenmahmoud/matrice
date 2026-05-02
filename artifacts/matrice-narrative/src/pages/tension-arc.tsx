import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Act = { label: string; description: string; tension: number; emotion: string; keyEvent: string };
type TensionArc = { acts: Act[]; overallShape: string; recommendation: string };

const EMOTION_COLORS: Record<string, string> = {
  fear: "#ef4444", tension: "#f97316", sadness: "#3b82f6",
  joy: "#22c55e", anger: "#ef4444", hope: "#a78bfa", default: "#8b5cf6"
};

function getTensionColor(tension: number) {
  if (tension >= 80) return "#ef4444";
  if (tension >= 60) return "#f97316";
  if (tension >= 40) return "#8b5cf6";
  return "#6366f1";
}

function CustomDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: Act }) {
  if (!cx || !cy || !payload) return null;
  const color = getTensionColor(payload.tension);
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#09090e" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.15} />
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Act }> }) {
  if (!active || !payload?.length) return null;
  const act = payload[0].payload;
  return (
    <div className="bg-[#12101a] border border-violet-500/30 rounded-xl p-4 shadow-xl max-w-xs">
      <p className="text-xs text-violet-400/70 uppercase tracking-widest mb-1">{act.emotion}</p>
      <p className="font-bold text-white text-sm mb-2">{act.label}</p>
      <p className="text-xs text-white/50 mb-2">{act.description}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: getTensionColor(act.tension) }} />
        <p className="text-xs text-white/40">{act.keyEvent}</p>
      </div>
    </div>
  );
}

export default function TensionArcPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<number | null>(null);

  const { data: arc, isLoading } = useQuery<TensionArc>({
    queryKey: [`/api/projects/${id}/tension-arc`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/tension-arc`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<TensionArc>;
    }),
    enabled: !!id,
    retry: false,
  });

  const generate = useMutation({
    mutationFn: () => fetch(`${BASE}/api/projects/${id}/generate-tension-arc`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/tension-arc`] });
      toast({ title: "Arc de tension généré", description: "Votre courbe dramatique est prête." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer l'arc." }),
  });

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!arc) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Arc de Tension</h1>
          <p className="text-muted-foreground max-w-md">
            Visualisez la courbe émotionnelle de votre histoire — les montées, les creux, les climax.
            L'IA analyse votre projet pour générer un arc dramatique personnalisé.
          </p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Générer l'Arc de Tension
        </Button>
      </div>
    </AppLayout>
  );

  const chartData = arc.acts.map((a, i) => ({ ...a, index: i + 1 }));

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Arc de Tension</h1>
            <p className="text-muted-foreground mt-1 text-sm">{arc.overallShape}</p>
          </div>
          <Button variant="outline" onClick={() => generate.mutate()} disabled={generate.isPending} size="sm">
            {generate.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
            Régénérer
          </Button>
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d0b14] border border-white/[0.06] rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tensionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <ReferenceLine y={80} stroke="rgba(239,68,68,0.15)" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="tension" stroke="#7c3aed" strokeWidth={2.5}
                fill="url(#tensionGrad)" dot={<CustomDot />} activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Act labels row */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {arc.acts.map((act, i) => (
            <button key={i} onClick={() => setSelected(selected === i ? null : i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs transition-all ${
                selected === i ? "bg-violet-600/20 border-violet-500/50 text-violet-200" : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]"
              }`}>
              <div className="w-2 h-2 rounded-full" style={{ background: getTensionColor(act.tension) }} />
              <span className="font-semibold text-center leading-tight max-w-[80px] line-clamp-2">{act.label}</span>
              <span className="text-[10px] opacity-60">{act.tension}/100</span>
            </button>
          ))}
        </div>

        {/* Selected act detail */}
        {selected !== null && arc.acts[selected] && (
          <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d0b14] border border-violet-500/25 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <p className="text-[10px] text-violet-400/60 uppercase tracking-widest mb-1">Séquence {selected + 1}</p>
              <p className="text-xl font-bold text-white mb-1">{arc.acts[selected].label}</p>
              <p className="text-sm text-white/40">{arc.acts[selected].emotion}</p>
              <div className="mt-4 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${arc.acts[selected].tension}%`, background: getTensionColor(arc.acts[selected].tension) }} />
              </div>
              <p className="text-xs text-white/25 mt-1">{arc.acts[selected].tension}/100 tension</p>
            </div>
            <div className="md:col-span-2 space-y-3">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Ce qui se passe</p>
                <p className="text-sm text-white/70 leading-relaxed">{arc.acts[selected].description}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Événement pivot</p>
                <p className="text-sm text-white/50 italic">"{arc.acts[selected].keyEvent}"</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendation */}
        <div className="flex gap-4 p-5 rounded-2xl bg-indigo-600/8 border border-indigo-500/20">
          <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-300 mb-1">Recommandation dramaturgique</p>
            <p className="text-sm text-white/50 leading-relaxed">{arc.recommendation}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
