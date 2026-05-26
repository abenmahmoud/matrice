import { useState } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMatrix, useGenerateMatrix, useUpdateMatrix, useCheckCoherence,
  getGetMatrixQueryKey
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditableField } from "@/components/EditableField";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { cn } from "@/lib/utils";

export default function MatrixPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [coherenceResult, setCoherenceResult] = useState<{
    score: number; issues: string[]; suggestions: string[]; isCoherent: boolean
  } | null>(null);

  const { data: matrix, isLoading } = useGetMatrix(id!, {
    query: { enabled: !!id, queryKey: getGetMatrixQueryKey(id!) }
  });
  const generate = useGenerateMatrix();
  const update = useUpdateMatrix();
  const checkCoherence = useCheckCoherence();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMatrixQueryKey(id!) });
        toast({ title: "Matrice générée", description: "Votre Matrice Narrative a été générée avec succès." });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer la matrice." })
    });
  };

  const handleUpdate = (field: string, value: string | string[]) => {
    if (!matrix) return;
    update.mutate({ id: id!, data: { ...matrix, [field]: value } as Parameters<typeof update.mutate>[0]["data"] }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetMatrixQueryKey(id!) })
    });
  };

  const handleCheckCoherence = () => {
    checkCoherence.mutate({ id: id! }, {
      onSuccess: (result) => {
        setCoherenceResult(result);
        toast({
          title: result.isCoherent ? "Matrice cohérente" : "Problèmes détectés",
          description: `Score de cohérence : ${result.score}/100`
        });
      }
    });
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  );

  if (!matrix) return (
    <AppLayout>
      <GenerateEmptyState
        title="Matrice Narrative"
        description="La Matrice Narrative est le fondement de votre univers. Elle structure tous les éléments narratifs, thématiques et symboliques de votre histoire."
        buttonLabel="Générer la Matrice Narrative"
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* ── PAGE HEADER ────────────────────────── */}
        <div className="border-b border-white/[0.05] bg-white/[0.01]">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Module I · Fondations</p>
              <h1 className="text-2xl font-serif font-bold text-white/90">Matrice Narrative</h1>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckCoherence}
                disabled={checkCoherence.isPending}
                className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80"
              >
                {checkCoherence.isPending
                  ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  : <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />}
                Cohérence
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={generate.isPending}
                className="bg-primary/90 hover:bg-primary text-white"
              >
                {generate.isPending
                  ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
                Régénérer
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* ── COHERENCE RESULT ───────────────────── */}
          {coherenceResult && (
            <div className={cn(
              "rounded-2xl border p-5",
              coherenceResult.isCoherent
                ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                : "border-amber-500/25 bg-amber-500/[0.04]"
            )}>
              <div className="flex items-center gap-3 mb-4">
                {coherenceResult.isCoherent
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                <span className="font-semibold text-white/80">Score de cohérence : {coherenceResult.score}/100</span>
                <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full ml-2 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", coherenceResult.isCoherent ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${coherenceResult.score}%` }}
                  />
                </div>
              </div>
              {coherenceResult.issues.length > 0 && (
                <div className="mb-3 space-y-1">
                  <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-2">Points à retravailler</p>
                  {coherenceResult.issues.map((issue, idx) => (
                    <p key={idx} className="text-sm text-white/45 pl-3 border-l border-amber-500/30">• {issue}</p>
                  ))}
                </div>
              )}
              {coherenceResult.suggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-2">Suggestions</p>
                  {coherenceResult.suggestions.map((s, idx) => (
                    <p key={idx} className="text-sm text-white/45 pl-3 border-l border-primary/30">• {s}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LOGLINE HERO ─────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-violet-600/[0.06]">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-600/10 blur-[60px] pointer-events-none" />
            <div className="relative z-10 p-5 sm:p-8 md:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <div className="text-[10px] font-bold text-violet-400/70 uppercase tracking-[0.2em]">Logline</div>
                <div className="flex-1 h-px bg-violet-500/15" />
                <div className="text-[9px] text-violet-400/30 uppercase tracking-wider">La phrase qui résume tout</div>
              </div>
              <EditableField
                label=""
                value={matrix.logline ?? ""}
                onSave={(v) => handleUpdate("logline", v)}
                multiline
                className="text-xl md:text-2xl font-serif text-white/85 leading-relaxed italic"
              />

              {/* Concept + Pitch court sous la logline */}
              <div className="mt-8 pt-8 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Concept central</p>
                  <EditableField
                    label=""
                    value={matrix.centralConcept ?? ""}
                    onSave={(v) => handleUpdate("centralConcept", v)}
                    multiline
                    className="text-sm text-white/60 leading-relaxed"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Pitch court</p>
                  <EditableField
                    label=""
                    value={matrix.shortPitch ?? ""}
                    onSave={(v) => handleUpdate("shortPitch", v)}
                    multiline
                    className="text-sm text-white/60 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis long */}
          <Section label="Synopsis" accent="violet">
            <EditableField label="Synopsis long" value={matrix.longSynopsis ?? ""} onSave={(v) => handleUpdate("longSynopsis", v)} multiline />
          </Section>

          {/* Thèmes & Symboles */}
          <Section label="Thèmes & Symboles" accent="indigo">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Thèmes</p>
                <div className="flex flex-wrap gap-2">
                  {matrix.themes?.map((t, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary/80 border border-primary/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Motifs symboliques</p>
                <div className="flex flex-wrap gap-2">
                  {matrix.symbolicMotifs?.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.07]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Conflit & Personnages */}
          <Section label="Conflit & Personnages" accent="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Protagoniste</p>
                <EditableField label="" value={matrix.protagonist ?? ""} onSave={(v) => handleUpdate("protagonist", v)} multiline className="text-sm text-white/65 leading-relaxed" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Antagoniste / Force d'opposition</p>
                <EditableField label="" value={matrix.antagonist ?? ""} onSave={(v) => handleUpdate("antagonist", v)} multiline className="text-sm text-white/65 leading-relaxed" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Conflit central</p>
              <EditableField label="" value={matrix.centralConflict ?? ""} onSave={(v) => handleUpdate("centralConflict", v)} multiline className="text-sm text-white/65 leading-relaxed" />
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Enjeux émotionnels</p>
              <EditableField label="" value={matrix.emotionalStakes ?? ""} onSave={(v) => handleUpdate("emotionalStakes", v)} multiline className="text-sm text-white/65 leading-relaxed" />
            </div>
          </Section>

          {/* Univers & Règles */}
          <Section label="Univers & Règles" accent="amber">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Monde visible</p>
                <EditableField label="" value={matrix.visibleWorld ?? ""} onSave={(v) => handleUpdate("visibleWorld", v)} multiline className="text-sm text-white/65 leading-relaxed" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Forces invisibles</p>
                <EditableField label="" value={matrix.invisibleForces ?? ""} onSave={(v) => handleUpdate("invisibleForces", v)} multiline className="text-sm text-white/65 leading-relaxed" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Règles temporelles</p>
                <EditableField label="" value={matrix.temporalRules ?? ""} onSave={(v) => handleUpdate("temporalRules", v)} multiline className="text-sm text-white/65 leading-relaxed" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Règles spatiales</p>
                <EditableField label="" value={matrix.spatialRules ?? ""} onSave={(v) => handleUpdate("spatialRules", v)} multiline className="text-sm text-white/65 leading-relaxed" />
              </div>
            </div>
          </Section>

          {/* Lois de l'univers */}
          {matrix.universeLaws && matrix.universeLaws.length > 0 && (
            <Section label="Lois de l'univers" accent="emerald">
              <div className="space-y-2">
                {matrix.universeLaws.map((l, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-black text-white/15 mt-0.5 flex-shrink-0 w-4">{i + 1}</span>
                    <p className="text-sm text-white/55 leading-relaxed">{l}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Secrets & Fins */}
          <Section label="Secrets & Fins possibles" accent="rose">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Secrets</p>
                <div className="space-y-2">
                  {matrix.secrets?.map((s, i) => (
                    <p key={i} className="text-sm text-white/55 pl-3 border-l-2 border-rose-500/25 leading-relaxed">{s}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.18em] mb-3">Fins possibles</p>
                <div className="space-y-2">
                  {matrix.possibleEndings?.map((e, i) => (
                    <p key={i} className="text-sm text-white/55 pl-3 border-l-2 border-indigo-500/25 leading-relaxed">{e}</p>
                  ))}
                </div>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </AppLayout>
  );
}

function Section({
  label, accent, children
}: {
  label: string;
  accent: "violet" | "indigo" | "blue" | "amber" | "emerald" | "rose";
  children: React.ReactNode;
}) {
  const accentMap = {
    violet: { dot: "bg-violet-500", text: "text-violet-300/60" },
    indigo: { dot: "bg-indigo-500", text: "text-indigo-300/60" },
    blue:   { dot: "bg-blue-500",   text: "text-blue-300/60" },
    amber:  { dot: "bg-amber-500",  text: "text-amber-300/60" },
    emerald:{ dot: "bg-emerald-500",text: "text-emerald-300/60" },
    rose:   { dot: "bg-rose-500",   text: "text-rose-300/60" },
  };
  const a = accentMap[accent];
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.04]">
        <div className={cn("w-1.5 h-1.5 rounded-full", a.dot)} />
        <h2 className={cn("text-xs font-bold uppercase tracking-[0.18em]", a.text)}>{label}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
