import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Clapperboard, ChevronDown, ChevronUp, Clock, MapPin, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Sequence = {
  numero: number;
  titre: string;
  lieu: string;
  moment: string;
  personnages: string[];
  fonctionDramatique: string;
  arcEmotionnel: string;
  dureeEstimee: number;
  liensThematiques: string;
  noteRealisateur: string;
};

type SequencierData = {
  sequences: Sequence[];
  totalDuree: number;
  structure: string;
  noteGlobale: string;
};

const FONCTION_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  "Exposition":          { color: "text-sky-400",      bg: "bg-sky-900/20",      border: "border-sky-500/25",      dot: "bg-sky-400" },
  "Mise en situation":   { color: "text-sky-400",      bg: "bg-sky-900/20",      border: "border-sky-500/25",      dot: "bg-sky-400" },
  "Incident déclencheur":{ color: "text-amber-400",    bg: "bg-amber-900/20",    border: "border-amber-500/25",    dot: "bg-amber-400" },
  "Premier tournant":    { color: "text-orange-400",   bg: "bg-orange-900/20",   border: "border-orange-500/25",   dot: "bg-orange-400" },
  "Complication":        { color: "text-violet-400",   bg: "bg-violet-900/20",   border: "border-violet-500/25",   dot: "bg-violet-400" },
  "Point milieu":        { color: "text-yellow-400",   bg: "bg-yellow-900/20",   border: "border-yellow-500/25",   dot: "bg-yellow-400" },
  "Crise montante":      { color: "text-rose-400",     bg: "bg-rose-900/20",     border: "border-rose-500/25",     dot: "bg-rose-400" },
  "Point bas":           { color: "text-purple-400",   bg: "bg-purple-900/20",   border: "border-purple-500/25",   dot: "bg-purple-400" },
  "Climax":              { color: "text-red-400",      bg: "bg-red-900/25",      border: "border-red-500/30",      dot: "bg-red-400" },
  "Résolution":          { color: "text-emerald-400",  bg: "bg-emerald-900/20",  border: "border-emerald-500/25",  dot: "bg-emerald-400" },
  "Dénouement":          { color: "text-teal-400",     bg: "bg-teal-900/20",     border: "border-teal-500/25",     dot: "bg-teal-400" },
};
const DEFAULT_FONCTION = { color: "text-white/50", bg: "bg-white/5", border: "border-white/10", dot: "bg-white/30" };

function getFonctionCfg(fn: string) {
  const exact = FONCTION_CONFIG[fn];
  if (exact) return exact;
  for (const [key, cfg] of Object.entries(FONCTION_CONFIG)) {
    if (fn.toLowerCase().includes(key.toLowerCase())) return cfg;
  }
  return DEFAULT_FONCTION;
}

function formatDuree(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h${m > 0 ? String(m).padStart(2, "0") : "00"}`;
}

export default function SequencierPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery<SequencierData>({
    queryKey: [`/api/projects/${id}/sequencier`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/sequencier`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<SequencierData>;
    }),
    enabled: !!id, retry: false,
  });

  const generate = useMutation({
    mutationFn: () => fetch(`${BASE}/api/projects/${id}/generate-sequencier`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/sequencier`] });
      setExpanded(null);
      toast({ title: "Séquencier généré", description: "Le découpage professionnel de votre film est prêt." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer le séquencier." }),
  });

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  );

  if (!data || !data.sequences?.length) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <Clapperboard className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Séquencier</h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Le document professionnel qui précède le scénario. L'IA découpe votre film en séquences numérotées — 
            chacune avec sa fonction dramatique, son arc émotionnel, sa durée estimée, et sa note de réalisation.
          </p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Découpage en cours…</>
            : <><Sparkles className="w-4 h-4 mr-2" />Générer le séquencier</>}
        </Button>
        {generate.isPending && (
          <p className="text-xs text-muted-foreground/50 animate-pulse">
            Analyse de la structure, construction des séquences… (30–60 secondes)
          </p>
        )}
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Header */}
        <div className="border-b border-white/[0.05] bg-[#0d0b14] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Clapperboard className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] uppercase tracking-widest text-indigo-400/60 font-semibold">
                  Document de Production
                </span>
              </div>
              <h1 className="text-xl font-serif font-bold">Séquencier</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-5 text-xs text-white/40">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  {data.sequences.length} séquences
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {formatDuree(data.totalDuree)}
                </span>
                <span className="text-white/30 font-medium">{data.structure}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}
                className="text-xs border-white/10">
                {generate.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                Régénérer
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Mobile stats */}
          <div className="sm:hidden flex items-center gap-4 mb-6 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" />{data.sequences.length} séquences</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{formatDuree(data.totalDuree)}</span>
          </div>

          {/* Timeline bar */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex h-2.5 rounded-full overflow-hidden mb-8 gap-px">
            {data.sequences.map((seq, i) => {
              const cfg = getFonctionCfg(seq.fonctionDramatique);
              const pct = seq.dureeEstimee / data.totalDuree * 100;
              return (
                <button key={i}
                  title={`${seq.numero}. ${seq.titre} (${seq.dureeEstimee} min)`}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${cfg.dot} opacity-70 hover:opacity-100 transition-opacity min-w-[3px]`}
                />
              );
            })}
          </motion.div>

          {/* Sequences list */}
          <div className="space-y-2">
            {data.sequences.map((seq, i) => {
              const cfg = getFonctionCfg(seq.fonctionDramatique);
              const isOpen = expanded === i;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.3 }}>
                  <div className={`rounded-xl border transition-all ${isOpen ? `${cfg.bg} ${cfg.border}` : "bg-[#0d0b14] border-white/[0.05] hover:border-white/10"}`}>

                    {/* Collapsed row */}
                    <button
                      className="w-full flex items-center gap-4 px-5 py-3.5 text-left"
                      onClick={() => setExpanded(isOpen ? null : i)}>

                      {/* Number */}
                      <span className={`text-sm font-mono font-bold w-6 text-right flex-shrink-0 ${cfg.color} opacity-80`}>
                        {String(seq.numero).padStart(2, "0")}
                      </span>

                      {/* Title */}
                      <span className="flex-1 font-serif text-sm font-semibold text-white/90 truncate">
                        {seq.titre}
                      </span>

                      {/* Badges */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          {seq.fonctionDramatique}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/25">
                          <Clock className="w-2.5 h-2.5" />
                          {seq.dureeEstimee} min
                        </span>
                      </div>

                      {isOpen
                        ? <ChevronUp className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                        : <ChevronDown className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />}
                    </button>

                    {/* Expanded */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden">
                          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-white/[0.05]">

                            {/* Location + characters */}
                            <div className="flex flex-wrap gap-3 pt-1">
                              <span className="flex items-center gap-1.5 text-xs text-white/40">
                                <MapPin className="w-3 h-3" />
                                {seq.lieu} · {seq.moment}
                              </span>
                              {seq.personnages.length > 0 && (
                                <span className="flex items-center gap-1.5 text-xs text-white/40">
                                  <Users className="w-3 h-3" />
                                  {seq.personnages.join(", ")}
                                </span>
                              )}
                              <span className={`sm:hidden text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {seq.fonctionDramatique}
                              </span>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                { label: "Arc émotionnel", value: seq.arcEmotionnel },
                                { label: "Liens thématiques", value: seq.liensThematiques },
                                { label: "Note de réalisation", value: seq.noteRealisateur, wide: true },
                              ].map(item => (
                                <div key={item.label}
                                  className={`p-3.5 rounded-xl bg-black/20 ${item.wide ? "md:col-span-2" : ""}`}>
                                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-semibold mb-1.5">
                                    {item.label}
                                  </p>
                                  <p className="text-sm text-white/55 leading-relaxed">{item.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Note globale */}
          {data.noteGlobale && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-8 p-6 rounded-2xl bg-[#0d0b14] border border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-3">
                Note dramaturgique
              </p>
              <p className="text-sm text-white/55 leading-relaxed">{data.noteGlobale}</p>
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/[0.05]">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-semibold mb-1">Structure</p>
                  <p className="text-sm font-bold text-indigo-400">{data.structure}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-semibold mb-1">Durée totale estimée</p>
                  <p className="text-sm font-bold text-white/70">{formatDuree(data.totalDuree)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-semibold mb-1">Nb séquences</p>
                  <p className="text-sm font-bold text-white/70">{data.sequences.length}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
