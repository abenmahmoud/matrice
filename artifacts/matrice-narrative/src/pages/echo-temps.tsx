import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clock, Globe2, BookOpen, Heart, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type MythicRes = { myth: string; culture: string; connection: string };
type HistoricalPar = { period: string; region: string; connection: string };
type CulturalEcho = { culture: string; storyTitle: string; connection: string };
type EchoData = {
  mythicResonances: MythicRes[];
  historicalParallels: HistoricalPar[];
  culturalEchoes: CulturalEcho[];
  temporalAnchor: string;
  universalWound: string;
  futureResonance: string;
};

const SECTION_COLORS = [
  { bg: "bg-violet-600/10", border: "border-violet-500/20", text: "text-violet-300", tag: "bg-violet-600/15" },
  { bg: "bg-amber-600/10", border: "border-amber-500/20", text: "text-amber-300", tag: "bg-amber-600/15" },
  { bg: "bg-emerald-600/10", border: "border-emerald-500/20", text: "text-emerald-300", tag: "bg-emerald-600/15" },
];

export default function EchoTempsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<EchoData>({
    queryKey: [`/api/projects/${id}/echo-temps`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/echo-temps`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<EchoData>;
    }),
    enabled: !!id, retry: false,
  });

  const generate = useMutation({
    mutationFn: () => fetch(`${BASE}/api/projects/${id}/generate-echo-temps`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/echo-temps`] });
      toast({ title: "Écho du Temps généré", description: "Les résonances à travers les âges sont prêtes." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer l'écho." }),
  });

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <Clock className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Écho du Temps</h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Votre histoire n'est pas seule. Elle vibre avec des millénaires de récits humains — mythes antiques, 
            événements historiques, traditions narratives du monde entier. L'IA découvre ces résonances profondes.
          </p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Explorer les résonances
        </Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">
        {/* Timeline header */}
        <div className="relative overflow-hidden border-b border-white/[0.05] bg-[#0d0b14]">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-amber-900/10 pointer-events-none" />
          <div className="max-w-5xl mx-auto px-8 py-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span className="text-[10px] uppercase tracking-widest text-violet-400/60 font-semibold">Écho du Temps</span>
                </div>
                <h1 className="text-2xl font-serif font-bold">Résonances à travers les âges</h1>
              </div>
              <Button variant="outline" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}
                className="text-xs border-white/10">
                {generate.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                Régénérer
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 space-y-10">

          {/* 3 Big Cards: Universal Wound, Temporal Anchor, Future Resonance */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Heart, color: "text-rose-400", bg: "bg-rose-600/8 border-rose-500/15", label: "Blessure Universelle", value: data.universalWound },
              { icon: Clock, color: "text-violet-400", bg: "bg-violet-600/8 border-violet-500/15", label: "Ancrage Temporel", value: data.temporalAnchor },
              { icon: Zap, color: "text-amber-400", bg: "bg-amber-600/8 border-amber-500/15", label: "Résonance Future", value: data.futureResonance },
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${item.bg}`}>
                <item.icon className={`w-5 h-5 mb-3 ${item.color}`} />
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-2">{item.label}</p>
                <p className="text-sm text-white/70 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Mythic Resonances */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Résonances Mythiques</h2>
            </div>
            <div className="space-y-3">
              {data.mythicResonances.map((r, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#0d0b14] border border-white/[0.06] flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-400">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white/85">{r.myth}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/15 text-violet-300/70">{r.culture}</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">{r.connection}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Historical Parallels */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Parallèles Historiques</h2>
            </div>
            <div className="space-y-3">
              {data.historicalParallels.map((r, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#0d0b14] border border-white/[0.06] flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white/85">{r.period}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/15 text-amber-300/70">{r.region}</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">{r.connection}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cultural Echoes */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Échos Culturels du Monde</h2>
            </div>
            <div className="space-y-3">
              {data.culturalEchoes.map((r, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#0d0b14] border border-white/[0.06] flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white/85">{r.storyTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/15 text-emerald-300/70">{r.culture}</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">{r.connection}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
