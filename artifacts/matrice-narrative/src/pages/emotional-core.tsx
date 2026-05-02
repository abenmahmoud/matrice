import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetEmotionalCore, useGenerateEmotionalCore, useUpdateEmotionalCore,
  useGenerateEmotionalPath, getGetEmotionalCoreQueryKey
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditableField } from "@/components/EditableField";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { useState } from "react";

const PATH_STAGES = [
  { key: "blessure", label: "Blessure initiale", color: "bg-red-500/20 border-red-500/40 text-red-300" },
  { key: "masque", label: "Masque", color: "bg-orange-500/20 border-orange-500/40 text-orange-300" },
  { key: "desir", label: "Désir apparent", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300" },
  { key: "conflit", label: "Conflit", color: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
  { key: "confrontation", label: "Confrontation", color: "bg-purple-500/20 border-purple-500/40 text-purple-300" },
  { key: "effondrement", label: "Effondrement", color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
  { key: "verite", label: "Vérité", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" },
  { key: "correction", label: "Correction", color: "bg-teal-500/20 border-teal-500/40 text-teal-300" },
  { key: "transformation", label: "Transformation", color: "bg-green-500/20 border-green-500/40 text-green-300" },
];

export default function EmotionalCorePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [emotionalPath, setEmotionalPath] = useState<Array<{ stage: string; label: string; description: string }>>([]);

  const { data: core, isLoading } = useGetEmotionalCore(id!, {
    query: { enabled: !!id, queryKey: getGetEmotionalCoreQueryKey(id!) }
  });
  const generate = useGenerateEmotionalCore();
  const update = useUpdateEmotionalCore();
  const generatePath = useGenerateEmotionalPath();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetEmotionalCoreQueryKey(id!) });
        toast({ title: "Noyau Émotionnel généré" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer le noyau émotionnel." })
    });
  };

  const handleGeneratePath = () => {
    generatePath.mutate({ id: id! }, {
      onSuccess: (result) => {
        if (result.stages) setEmotionalPath(result.stages);
        toast({ title: "Chemin émotionnel généré" });
      }
    });
  };

  const handleUpdate = (field: string, value: string) => {
    if (!core) return;
    update.mutate({ id: id!, data: { ...core, [field]: value } as Parameters<typeof update.mutate>[0]["data"] }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetEmotionalCoreQueryKey(id!) })
    });
  };

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!core) return (
    <AppLayout>
      <GenerateEmptyState
        title="Noyau Émotionnel"
        description="Le Noyau Émotionnel est l'âme de votre histoire. Il définit la blessure profonde, les désirs, les peurs et l'arc de transformation de votre protagoniste."
        buttonLabel="Générer le Noyau Émotionnel"
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
            <h1 className="text-3xl font-serif font-bold">Noyau Émotionnel</h1>
            <p className="text-muted-foreground mt-1">L'âme narrative de votre histoire</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <SectionCard title="Émotions fondamentales" icon={<Heart className="w-4 h-4 text-red-400" />}>
          <EditableField label="Émotion dominante" value={core.dominantEmotion ?? ""} onSave={(v) => handleUpdate("dominantEmotion", v)} multiline />
          <EditableField label="Blessure cachée" value={core.hiddenWound ?? ""} onSave={(v) => handleUpdate("hiddenWound", v)} multiline />
          <EditableField label="Manque émotionnel" value={core.emotionalLack ?? ""} onSave={(v) => handleUpdate("emotionalLack", v)} multiline />
          <EditableField label="Signal de l'enfant intérieur" value={core.innerChildSignal ?? ""} onSave={(v) => handleUpdate("innerChildSignal", v)} multiline />
        </SectionCard>

        <SectionCard title="Masque & Désirs">
          <EditableField label="Masque de protection" value={core.protectionMask ?? ""} onSave={(v) => handleUpdate("protectionMask", v)} multiline />
          <EditableField label="Désir apparent" value={core.apparentDesire ?? ""} onSave={(v) => handleUpdate("apparentDesire", v)} multiline />
          <EditableField label="Besoin profond" value={core.deepNeed ?? ""} onSave={(v) => handleUpdate("deepNeed", v)} multiline />
        </SectionCard>

        <SectionCard title="Peurs & Contradictions">
          <EditableField label="Peur centrale" value={core.centralFear ?? ""} onSave={(v) => handleUpdate("centralFear", v)} multiline />
          <EditableField label="Point de honte" value={core.shamePoint ?? ""} onSave={(v) => handleUpdate("shamePoint", v)} multiline />
          <EditableField label="Point de culpabilité" value={core.guiltyPoint ?? ""} onSave={(v) => handleUpdate("guiltyPoint", v)} multiline />
          <EditableField label="Contradiction émotionnelle" value={core.emotionalContradiction ?? ""} onSave={(v) => handleUpdate("emotionalContradiction", v)} multiline />
        </SectionCard>

        <SectionCard title="Symboles & Antagoniste émotionnel">
          <EditableField label="Objet symbolique" value={core.symbolicObject ?? ""} onSave={(v) => handleUpdate("symbolicObject", v)} />
          <EditableField label="Lieu symbolique" value={core.symbolicPlace ?? ""} onSave={(v) => handleUpdate("symbolicPlace", v)} />
          <EditableField label="Antagoniste émotionnel" value={core.emotionalAntagonist ?? ""} onSave={(v) => handleUpdate("emotionalAntagonist", v)} multiline />
        </SectionCard>

        <SectionCard title="Arc de transformation">
          <EditableField label="Chemin de correction émotionnelle" value={core.correctionPath ?? ""} onSave={(v) => handleUpdate("correctionPath", v)} multiline />
          <EditableField label="Arc de transformation" value={core.transformationArc ?? ""} onSave={(v) => handleUpdate("transformationArc", v)} multiline />
          <EditableField label="État émotionnel final" value={core.finalEmotionalState ?? ""} onSave={(v) => handleUpdate("finalEmotionalState", v)} multiline />
        </SectionCard>

        <SectionCard title="Chemin émotionnel">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Visualisation de l'arc émotionnel narratif</p>
            <Button size="sm" variant="outline" onClick={handleGeneratePath} disabled={generatePath.isPending}>
              {generatePath.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
              Générer le chemin
            </Button>
          </div>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/40" />
            <div className="relative flex gap-2 overflow-x-auto pb-4">
              {(emotionalPath.length > 0 ? emotionalPath : PATH_STAGES.map(s => ({ stage: s.key, label: s.label, description: "" }))).map((stage, i) => {
                const stageConfig = PATH_STAGES[i] ?? PATH_STAGES[0];
                return (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[90px]">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 ${stageConfig.color}`}>
                      {i + 1}
                    </div>
                    <p className="text-xs font-medium text-center leading-tight">{stage.label}</p>
                    {stage.description && (
                      <p className="text-xs text-muted-foreground text-center leading-tight max-w-[80px] line-clamp-2">{stage.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
