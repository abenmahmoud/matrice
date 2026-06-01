import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Palette, Music2, Eye, Wind, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ColorSwatch = { name: string; hex: string; role: string };
type MusicRef = { genre: string; artists: string[]; mood: string };
type SensoryNotes = { smell: string; sound: string; touch: string };
type AtmosphereData = {
  colorPalette: ColorSwatch[];
  lightingStyle: string;
  musicReferences: MusicRef[];
  cinematicStyle: string;
  textures: string[];
  sensoryNotes: SensoryNotes;
  visualReferences: string[];
};

function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function AtmospherePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: atm, isLoading } = useQuery<AtmosphereData>({
    queryKey: [`/api/projects/${id}/atmosphere`],
    queryFn: () => apiFetch(`${BASE}/api/projects/${id}/atmosphere`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<AtmosphereData>;
    }),
    enabled: !!id,
    retry: false,
  });

  const generate = useMutation({
    mutationFn: () => apiFetch(`${BASE}/api/projects/${id}/generate-atmosphere`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/atmosphere`] });
      toast({ title: "Atmosphère générée", description: "Votre chambre des atmosphères est prête." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer l'atmosphère." }),
  });

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!atm) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <Palette className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Chambre des Atmosphères</h1>
          <p className="text-muted-foreground max-w-md">
            Palette de couleurs, références musicales, paysage sonore, matières, style cinématographique.
            Tout l'univers sensoriel de votre œuvre en un seul regard.
          </p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Générer les Atmosphères
        </Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">
        {/* Palette Header */}
        <div className="relative h-24 flex overflow-hidden">
          {atm.colorPalette.map((c, i) => (
            <div key={i} className="flex-1 relative group cursor-default transition-all hover:flex-[1.4]"
              style={{ background: c.hex }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 bg-black/40">
                <p className="text-[10px] font-bold text-white text-center leading-tight">{c.name}</p>
                <p className="text-[9px] text-white/60 text-center">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold">Chambre des Atmosphères</h1>
              <p className="text-muted-foreground mt-1 text-sm">{atm.cinematicStyle}</p>
            </div>
            <Button variant="outline" onClick={() => generate.mutate()} disabled={generate.isPending} size="sm">
              {generate.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
              Régénérer
            </Button>
          </div>

          {/* Color Palette Detail */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Palette Chromatique</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {atm.colorPalette.map((c, i) => {
                const isLight = luminance(c.hex) > 0.5;
                return (
                  <div key={i} className="rounded-xl overflow-hidden border border-white/[0.06]">
                    <div className="h-20" style={{ background: c.hex }} />
                    <div className="p-3 bg-[#0d0b14]">
                      <p className="text-xs font-bold text-white/80">{c.name}</p>
                      <p className="text-[10px] text-white/30 font-mono mt-0.5">{c.hex}</p>
                      <p className="text-[10px] text-white/25 mt-1.5 leading-tight">{c.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 2-col: Music + Sensory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Music */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <Music2 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Univers Musical</h2>
              </div>
              <div className="space-y-3">
                {atm.musicReferences.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0d0b14] border border-white/[0.06]">
                    <p className="text-xs font-bold text-indigo-300 mb-1">{m.genre}</p>
                    <p className="text-xs text-white/50 mb-2">{m.artists.join(" · ")}</p>
                    <p className="text-xs text-white/30 italic">{m.mood}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sensory */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Notes Sensorielles</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Olfactif", value: atm.sensoryNotes.smell, color: "text-emerald-300" },
                  { label: "Sonore", value: atm.sensoryNotes.sound, color: "text-blue-300" },
                  { label: "Tactile", value: atm.sensoryNotes.touch, color: "text-amber-300" },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-xl bg-[#0d0b14] border border-white/[0.06] flex gap-3">
                    <p className={`text-xs font-bold w-16 flex-shrink-0 ${s.color}`}>{s.label}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Lighting */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-[#0d0b14] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Direction Lumière & Style</h2>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{atm.lightingStyle}</p>
          </motion.div>

          {/* Textures */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Matières & Textures</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {atm.textures.map((t, i) => (
                <span key={i} className="text-sm px-4 py-2 rounded-full bg-rose-600/10 text-rose-300/70 border border-rose-500/20">{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Visual References */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Références Visuelles</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {atm.visualReferences.map((r, i) => (
                <span key={i} className="text-sm px-4 py-2 rounded-full bg-violet-600/10 text-violet-300/70 border border-violet-500/20">{r}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
