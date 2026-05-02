import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AtmosphereData = {
  colorPalette: Array<{ name: string; hex: string; role: string }>;
  lightingStyle: string;
  musicReferences: Array<{ genre: string; artists: string[]; mood: string }>;
  cinematicStyle: string;
  textures: string[];
  sensoryNotes: { smell: string; sound: string; touch: string };
  visualReferences: string[];
};

type TensionArc = {
  acts: Array<{ label: string; description: string; tension: number; emotion: string; keyEvent: string }>;
  overallShape: string;
  recommendation: string;
};

function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function DirectorNotebookPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading: projLoading } = useGetProject(id!, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id!) }
  });

  const { data: atm, isLoading: atmLoading } = useQuery<AtmosphereData>({
    queryKey: [`/api/projects/${id}/atmosphere`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/atmosphere`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<AtmosphereData>;
    }),
    enabled: !!id, retry: false,
  });

  const { data: arc, isLoading: arcLoading } = useQuery<TensionArc>({
    queryKey: [`/api/projects/${id}/tension-arc`],
    queryFn: () => fetch(`${BASE}/api/projects/${id}/tension-arc`).then(async r => {
      if (!r.ok) throw new Error("not found");
      return r.json() as Promise<TensionArc>;
    }),
    enabled: !!id, retry: false,
  });

  const isLoading = projLoading || atmLoading || arcLoading;
  const hasAtm = !!atm;
  const hasArc = !!arc;
  const hasAny = hasAtm || hasArc;

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Screen-only toolbar */}
        <div className="print:hidden border-b border-white/[0.05] bg-[#0d0b14] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold">Carnet de Tournage</h1>
              <p className="text-[11px] text-muted-foreground">Document de production — imprimable PDF</p>
            </div>
            <div className="flex items-center gap-3">
              {!hasAny && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Générez d'abord Atmosphères et Arc de Tension</span>
                </div>
              )}
              <Button onClick={() => window.print()} disabled={!hasAny}
                className="gap-2 bg-white text-black hover:bg-white/90 text-sm font-semibold">
                <Printer className="w-4 h-4" />
                Imprimer / PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Print document */}
        <div className="max-w-4xl mx-auto px-8 py-10 print:px-0 print:py-0 print:max-w-none">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-10 print:space-y-8">

            {/* Cover */}
            <div className="print:page-break-after-avoid">
              <div className="border-b-2 border-violet-500/40 pb-8 mb-8 print:border-black/20">
                <p className="text-[10px] uppercase tracking-[0.25em] text-violet-400/70 font-semibold mb-3 print:text-black/40">
                  CARNET DE TOURNAGE
                </p>
                <h1 className="text-4xl font-serif font-bold mb-2 print:text-black">{project?.title ?? "Sans titre"}</h1>
                <p className="text-white/40 print:text-black/40 text-sm">
                  {project?.genre} · {project?.tone} · {project?.targetFormat}
                </p>
                <p className="text-white/20 print:text-black/20 text-xs mt-1">
                  Généré le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {project?.rawIdea && (
                <div className="p-5 rounded-xl bg-[#0d0b14] border border-white/[0.06] print:bg-transparent print:border-black/10">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 print:text-black/30 font-semibold mb-2">Vision de l'œuvre</p>
                  <p className="text-sm text-white/60 print:text-black/60 leading-relaxed">{project.rawIdea}</p>
                </div>
              )}
            </div>

            {/* Atmosphere */}
            {atm && (
              <section>
                <h2 className="text-lg font-serif font-bold mb-5 pb-3 border-b border-white/[0.08] print:border-black/15 print:text-black">
                  Chambre des Atmosphères
                </h2>

                {/* Color palette strip */}
                <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-4">
                  {atm.colorPalette.map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c.hex }}
                      title={`${c.name} — ${c.hex}`} />
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 print:grid-cols-5">
                  {atm.colorPalette.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded flex-shrink-0 border border-white/10 print:border-black/10"
                        style={{ background: c.hex }} />
                      <div>
                        <p className="text-xs font-bold text-white/80 print:text-black">{c.name}</p>
                        <p className="text-[10px] text-white/30 print:text-black/40 font-mono">{c.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-[#0d0b14] border border-white/[0.06] print:bg-transparent print:border-black/10">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 print:text-black/30 font-semibold mb-1.5">Style cinématographique</p>
                    <p className="text-sm text-white/60 print:text-black/60">{atm.cinematicStyle}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0d0b14] border border-white/[0.06] print:bg-transparent print:border-black/10">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 print:text-black/30 font-semibold mb-1.5">Direction lumière</p>
                    <p className="text-sm text-white/60 print:text-black/60">{atm.lightingStyle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Olfactif", value: atm.sensoryNotes.smell },
                    { label: "Sonore", value: atm.sensoryNotes.sound },
                    { label: "Tactile", value: atm.sensoryNotes.touch },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-[#0d0b14] border border-white/[0.06] print:bg-transparent print:border-black/10">
                      <p className="text-[9px] uppercase tracking-widest text-white/25 print:text-black/30 font-semibold mb-1">{s.label}</p>
                      <p className="text-xs text-white/55 print:text-black/55">{s.value}</p>
                    </div>
                  ))}
                </div>

                {atm.musicReferences.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 print:text-black/30 font-semibold mb-2">Univers Musical</p>
                    <div className="flex flex-wrap gap-2">
                      {atm.musicReferences.map((m, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-[#0d0b14] border border-white/[0.08] text-white/50 print:border-black/10 print:text-black/50">
                          {m.genre} — {m.artists.join(", ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Tension Arc */}
            {arc && arc.acts.length > 0 && (
              <section>
                <h2 className="text-lg font-serif font-bold mb-5 pb-3 border-b border-white/[0.08] print:border-black/15 print:text-black">
                  Arc de Tension
                </h2>
                <p className="text-sm text-white/50 print:text-black/50 mb-4 italic">{arc.overallShape}</p>

                <div className="space-y-3">
                  {arc.acts.map((act, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#0d0b14] border border-white/[0.06] print:bg-transparent print:border-black/10">
                      <div className="w-12 flex-shrink-0 text-center">
                        <div className={`text-lg font-bold ${act.tension >= 70 ? "text-red-400" : act.tension >= 40 ? "text-amber-400" : "text-emerald-400"} print:text-black`}>
                          {act.tension}%
                        </div>
                        <p className="text-[8px] text-white/20 print:text-black/30 uppercase">tension</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-white/80 print:text-black truncate">{act.label}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30 print:bg-black/5 print:text-black/40 flex-shrink-0">
                            {act.emotion}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 print:text-black/40 leading-relaxed">{act.keyEvent}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {arc.recommendation && (
                  <div className="mt-4 p-4 rounded-xl border border-violet-500/20 bg-violet-600/5 print:border-black/10 print:bg-transparent">
                    <p className="text-[9px] uppercase tracking-widest text-violet-400/60 print:text-black/30 font-semibold mb-1">Recommandation</p>
                    <p className="text-sm text-white/60 print:text-black/60">{arc.recommendation}</p>
                  </div>
                )}
              </section>
            )}

            {!hasAny && (
              <div className="print:hidden flex flex-col items-center justify-center py-24 text-center gap-4">
                <AlertTriangle className="w-10 h-10 text-amber-500/50" />
                <p className="text-white/40 max-w-sm text-sm leading-relaxed">
                  Ce carnet est vide pour l'instant. Générez d'abord votre{" "}
                  <strong className="text-white/60">Chambre des Atmosphères</strong> et votre{" "}
                  <strong className="text-white/60">Arc de Tension</strong> pour les voir apparaître ici.
                </p>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </AppLayout>
  );
}
