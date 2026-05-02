import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Telescope, Eye, HelpCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type MiroirData = {
  trueTheme: string;
  shadowStory: string;
  blindSpots: string[];
  resonanceGaps: Array<{ zone: string; reflection: string }>;
  artisticInvitations: Array<{ invitation: string; why: string }>;
  mirrorPhrase: string;
};

export default function MiroirPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [openInvitation, setOpenInvitation] = useState<number | null>(null);

  const { data, isLoading } = useQuery<MiroirData>({
    queryKey: [`/api/projects/${id}/miroir`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/miroir`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<MiroirData>;
    }),
    enabled: !!id, retry: false,
  });

  const generate = useMutation({
    mutationFn: () => fetch(`${BASE}/api/projects/${id}/generate-miroir`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/miroir`] });
      toast({ title: "Miroir généré", description: "La réflexion artistique de votre œuvre est prête." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer le miroir." }),
  });

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <Telescope className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Miroir Artistique</h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Pas de correction. Pas de jugement. Un miroir intelligent qui réfléchit votre œuvre — 
            ce qu'elle dit vraiment, ce qu'elle cache, et des invitations poétiques pour aller plus loin.
          </p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Regarder dans le miroir
        </Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Mirror phrase hero */}
        <div className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto px-8 py-12 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Telescope className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] uppercase tracking-widest text-indigo-400/60 font-semibold">Miroir Artistique</span>
            </div>
            <blockquote className="text-xl font-serif italic text-white/80 leading-relaxed mb-6">
              « {data.mirrorPhrase} »
            </blockquote>
            <Button variant="outline" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}
              className="text-xs border-white/10">
              {generate.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
              Regarder encore
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

          {/* True Theme + Shadow Story */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#0d0b14] border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-indigo-400" />
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Le Vrai Sujet</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{data.trueTheme}</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0d0b14] border border-violet-500/20">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-violet-400" />
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">L'Histoire Souterraine</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{data.shadowStory}</p>
            </div>
          </motion.div>

          {/* Blind Spots — gentle */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Ce que vous ne voyez peut-être pas encore</h2>
            </div>
            <div className="space-y-2">
              {data.blindSpots.map((spot, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#0d0b14] border border-white/[0.05]">
                  <span className="text-rose-400/50 text-xs font-serif mt-0.5 flex-shrink-0">◆</span>
                  <p className="text-sm text-white/55 leading-relaxed italic">{spot}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resonance Gaps */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-4">
              <Telescope className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Espaces de résonance</h2>
            </div>
            <div className="space-y-3">
              {data.resonanceGaps.map((gap, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#0d0b14] border border-white/[0.06]">
                  <p className="text-xs font-bold text-sky-300/70 mb-2">{gap.zone}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{gap.reflection}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Artistic Invitations — accordion */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Invitations Artistiques</h2>
              <span className="text-[10px] text-white/20 ml-1">— pas des corrections, des ouvertures</span>
            </div>
            <div className="space-y-2">
              {data.artisticInvitations.map((inv, i) => (
                <div key={i} className="rounded-2xl bg-[#0d0b14] border border-amber-500/15 overflow-hidden">
                  <button onClick={() => setOpenInvitation(openInvitation === i ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
                    <span className="text-amber-400/60 text-sm font-serif flex-shrink-0">✦</span>
                    <p className="text-sm text-amber-200/80 font-medium flex-1 leading-snug">{inv.invitation}</p>
                    <ChevronDown className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform ${openInvitation === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openInvitation === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="px-5 pb-4 border-t border-white/[0.04]">
                          <p className="text-xs text-white/40 leading-relaxed mt-3">{inv.why}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
