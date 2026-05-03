import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText, Printer, Copy, Check, ChevronDown, ChevronUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type PersonnageVision = { nom: string; visionRealisateur: string };

type NoteIntentionData = {
  vision: string;
  partiPrisMiseEnScene: string;
  personnagesVision: PersonnageVision[];
  universVisuel: string;
  musiqueEtSon: string;
  positionnement: string;
  pourquoiMaintenant: string;
  motFinal: string;
};

const SECTIONS = [
  { key: "vision",              label: "La Vision",                        sublabel: "Pourquoi ce film, pourquoi maintenant, ce qui m'anime profondément" },
  { key: "partiPrisMiseEnScene", label: "Parti Pris de Mise en Scène",     sublabel: "Choix esthétiques, regard caméra, rythme, approche formelle" },
  { key: "universVisuel",       label: "L'Univers Visuel",                 sublabel: "Atmosphère, références cinématographiques, palette, lumière" },
  { key: "musiqueEtSon",        label: "Musique & Son",                    sublabel: "Approche sonore, parti pris musical, silence comme matière" },
  { key: "positionnement",      label: "Positionnement",                   sublabel: "Où ce film se situe dans le cinéma d'aujourd'hui" },
  { key: "pourquoiMaintenant",  label: "Pourquoi Maintenant",              sublabel: "Urgence contemporaine, résonance avec notre époque" },
] as const;

function Section({ label, sublabel, content, index }: {
  label: string; sublabel: string; content: string; index: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-4 px-7 py-5 text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400/50 font-semibold mb-0.5">{sublabel}</p>
          <h3 className="text-base font-serif font-bold text-white/90">{label}</h3>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/20 mt-1 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/20 mt-1 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div className="px-7 pb-7 pt-0 border-t border-white/[0.04]">
              <p className="text-[15px] text-white/65 leading-[1.9] pt-5 font-light">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CncBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
      <Award className="w-3 h-3 text-amber-400 shrink-0" />
      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">CNC · SACD · Festivals</span>
    </div>
  );
}

export default function NoteIntentionPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: project } = useGetProject(id!, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id!) }
  });

  const { data, isLoading } = useQuery<NoteIntentionData>({
    queryKey: [`/api/projects/${id}/note-intention`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/note-intention`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<NoteIntentionData>;
    }),
    enabled: !!id, retry: false,
  });

  const generate = useMutation({
    mutationFn: () => fetch(`${BASE}/api/projects/${id}/generate-note-intention`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/projects/${id}/note-intention`] });
      toast({ title: "Note d'intention générée", description: "Votre document de présentation est prêt." });
    },
    onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer la note d'intention." }),
  });

  const handleCopy = () => {
    if (!data || !project) return;
    const text = [
      `NOTE D'INTENTION`,
      `${project.title}`,
      ``,
      `LA VISION`,
      data.vision,
      ``,
      `PARTI PRIS DE MISE EN SCÈNE`,
      data.partiPrisMiseEnScene,
      ``,
      `L'UNIVERS VISUEL`,
      data.universVisuel,
      ``,
      `MUSIQUE & SON`,
      data.musiqueEtSon,
      ``,
      `POSITIONNEMENT`,
      data.positionnement,
      ``,
      `POURQUOI MAINTENANT`,
      data.pourquoiMaintenant,
      ...(data.personnagesVision?.length ? [
        ``,
        `LES PERSONNAGES`,
        ...data.personnagesVision.map(p => `${p.nom}\n${p.visionRealisateur}`)
      ] : []),
      ``,
      data.motFinal,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié", description: "La note d'intention est dans votre presse-papiers." });
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <FileText className="w-8 h-8 text-violet-400" />
        </div>
        <div className="max-w-lg">
          <h1 className="text-3xl font-serif font-bold mb-4">Note d'Intention</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Le document qui dit <em>qui vous êtes en tant que cinéaste</em> — pas seulement ce que raconte le film,
            mais <em>pourquoi vous</em>, <em>comment vous le voyez</em>, et <em>ce qu'il apporte au monde aujourd'hui</em>.
          </p>
          <p className="text-muted-foreground/50 text-xs leading-relaxed mb-3">
            Envoyé au CNC, aux producteurs, aux festivals. Généré depuis toute votre matrice créative.
          </p>
          <div className="flex justify-center mb-4">
            <CncBadge />
          </div>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending} size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          {generate.isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rédaction en cours…</>
            : <><Sparkles className="w-4 h-4 mr-2" />Rédiger la note d'intention</>}
        </Button>
        {generate.isPending && (
          <p className="text-xs text-muted-foreground/40 animate-pulse">
            L'IA lit toute votre matrice et rédige votre note… (45–90 secondes)
          </p>
        )}
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Header */}
        <div className="border-b border-white/[0.05] bg-[#0d0b14]">
          <div className="max-w-3xl mx-auto px-8 py-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] uppercase tracking-widest text-violet-400/60 font-semibold">
                  Document de Présentation
                </span>
              </div>
              <h1 className="text-xl font-serif font-bold">Note d'Intention</h1>
              <div className="mt-1.5">
                <CncBadge />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleCopy}
                className="text-xs border-white/10 gap-1.5">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copié" : "Copier"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}
                className="text-xs border-white/10 gap-1.5">
                <Printer className="w-3 h-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}
                className="text-xs border-white/10">
                {generate.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                Régénérer
              </Button>
            </div>
          </div>
        </div>

        {/* CNC info banner */}
        <div className="border-b border-amber-500/10 bg-amber-500/[0.03]">
          <div className="max-w-3xl mx-auto px-8 py-3 flex items-center gap-3">
            <Award className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
            <p className="text-[11px] text-amber-400/60 leading-relaxed">
              Ce document est généré selon les standards du CNC (Avance sur recettes), de la SACD, et des conventions des festivals Cannes · César · Angoulême · Berlinale.
            </p>
          </div>
        </div>

        {/* Document */}
        <div className="max-w-3xl mx-auto px-8 py-10 space-y-3">

          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pb-8 mb-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400/50 font-semibold mb-3">
              Note d'Intention Cinématographique
            </p>
            <h2 className="text-4xl font-serif font-bold text-white mb-2">{project?.title}</h2>
            {project && (
              <p className="text-sm text-white/30 tracking-wide">
                {project.genre} · {project.tone} · {project.targetFormat}
              </p>
            )}
          </motion.div>

          {/* Main sections */}
          {SECTIONS.map((s, i) => {
            const content = data[s.key as keyof NoteIntentionData] as string;
            if (!content) return null;
            return <Section key={s.key} label={s.label} sublabel={s.sublabel} content={content} index={i} />;
          })}

          {/* Personnages vision */}
          {data.personnagesVision?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-white/[0.04]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400/50 font-semibold mb-0.5">
                  Tel que je les vois
                </p>
                <h3 className="text-base font-serif font-bold text-white/90">Les Personnages</h3>
              </div>
              <div className="px-7 py-6 space-y-6">
                {data.personnagesVision.map((p, i) => (
                  <div key={i} className={i > 0 ? "pt-6 border-t border-white/[0.04]" : ""}>
                    <p className="text-sm font-bold text-violet-300/80 mb-2 uppercase tracking-wider">{p.nom}</p>
                    <p className="text-[15px] text-white/60 leading-[1.9] font-light">{p.visionRealisateur}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mot final */}
          {data.motFinal && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 px-8 py-10 rounded-2xl bg-gradient-to-br from-violet-950/30 to-indigo-950/20 border border-violet-500/10 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400/40 font-semibold mb-6">
                En guise de conclusion
              </p>
              <blockquote className="text-lg font-serif text-white/70 leading-[1.85] italic max-w-xl mx-auto">
                "{data.motFinal}"
              </blockquote>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
