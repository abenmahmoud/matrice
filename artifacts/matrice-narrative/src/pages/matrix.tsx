import { useState } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMatrix, useGenerateMatrix, useUpdateMatrix, useCheckCoherence,
  getGetMatrixQueryKey
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditableField } from "@/components/EditableField";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";

export default function MatrixPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [coherenceResult, setCoherenceResult] = useState<{ score: number; issues: string[]; suggestions: string[]; isCoherent: boolean } | null>(null);

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
        toast({ title: result.isCoherent ? "Matrice cohérente" : "Problèmes détectés", description: `Score de cohérence : ${result.score}/100` });
      }
    });
  };

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
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
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Matrice Narrative</h1>
            <p className="text-muted-foreground mt-1">La source de vérité de votre univers fictionnel</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCheckCoherence} disabled={checkCoherence.isPending}>
              {checkCoherence.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Vérifier la cohérence
            </Button>
            <Button onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Régénérer
            </Button>
          </div>
        </div>

        {coherenceResult && (
          <div className={`rounded-xl border p-4 ${coherenceResult.isCoherent ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className={`w-5 h-5 ${coherenceResult.isCoherent ? "text-green-400" : "text-yellow-400"}`} />
              <span className="font-semibold">Score de cohérence : {coherenceResult.score}/100</span>
            </div>
            {coherenceResult.issues.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-yellow-400 mb-1">Problèmes :</p>
                {coherenceResult.issues.map((i, idx) => <p key={idx} className="text-sm text-muted-foreground">• {i}</p>)}
              </div>
            )}
            {coherenceResult.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-primary mb-1">Suggestions :</p>
                {coherenceResult.suggestions.map((s, idx) => <p key={idx} className="text-sm text-muted-foreground">• {s}</p>)}
              </div>
            )}
          </div>
        )}

        <SectionCard title="Concept & Logline">
          <EditableField label="Concept central" value={matrix.centralConcept ?? ""} onSave={(v) => handleUpdate("centralConcept", v)} multiline />
          <EditableField label="Logline" value={matrix.logline ?? ""} onSave={(v) => handleUpdate("logline", v)} multiline />
          <EditableField label="Pitch court" value={matrix.shortPitch ?? ""} onSave={(v) => handleUpdate("shortPitch", v)} multiline />
          <EditableField label="Synopsis long" value={matrix.longSynopsis ?? ""} onSave={(v) => handleUpdate("longSynopsis", v)} multiline />
        </SectionCard>

        <SectionCard title="Univers & Règles">
          <EditableField label="Monde visible" value={matrix.visibleWorld ?? ""} onSave={(v) => handleUpdate("visibleWorld", v)} multiline />
          <EditableField label="Forces invisibles" value={matrix.invisibleForces ?? ""} onSave={(v) => handleUpdate("invisibleForces", v)} multiline />
          <EditableField label="Règles temporelles" value={matrix.temporalRules ?? ""} onSave={(v) => handleUpdate("temporalRules", v)} multiline />
          <EditableField label="Règles spatiales" value={matrix.spatialRules ?? ""} onSave={(v) => handleUpdate("spatialRules", v)} multiline />
        </SectionCard>

        <SectionCard title="Conflit & Personnages">
          <EditableField label="Conflit central" value={matrix.centralConflict ?? ""} onSave={(v) => handleUpdate("centralConflict", v)} multiline />
          <EditableField label="Protagoniste" value={matrix.protagonist ?? ""} onSave={(v) => handleUpdate("protagonist", v)} multiline />
          <EditableField label="Antagoniste ou force d'opposition" value={matrix.antagonist ?? ""} onSave={(v) => handleUpdate("antagonist", v)} multiline />
          <EditableField label="Enjeux émotionnels" value={matrix.emotionalStakes ?? ""} onSave={(v) => handleUpdate("emotionalStakes", v)} multiline />
        </SectionCard>

        <SectionCard title="Thèmes & Symboles">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Thèmes</p>
            <div className="flex flex-wrap gap-2">
              {matrix.themes?.map((t, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Motifs symboliques</p>
            <div className="flex flex-wrap gap-2">
              {matrix.symbolicMotifs?.map((m, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{m}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Secrets & Fins possibles">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Secrets</p>
            {matrix.secrets?.map((s, i) => (
              <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-primary/30">{s}</p>
            ))}
          </div>
          <div className="space-y-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fins possibles</p>
            {matrix.possibleEndings?.map((e, i) => (
              <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-2/30">{e}</p>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Lois de l'univers">
          {matrix.universeLaws?.map((l, i) => (
            <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-3/30">{l}</p>
          ))}
        </SectionCard>
      </div>
    </AppLayout>
  );
}
