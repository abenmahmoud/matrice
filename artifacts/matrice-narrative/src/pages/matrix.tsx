import { useState } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetMatrixQueryKey,
  useCheckCoherence,
  useGenerateMatrix,
  useGetMatrix,
  useUpdateMatrix,
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
    score: number;
    issues: string[];
    suggestions: string[];
    isCoherent: boolean;
  } | null>(null);

  const { data: matrix, isLoading } = useGetMatrix(id!, {
    query: { enabled: !!id, queryKey: getGetMatrixQueryKey(id!) },
  });
  const generate = useGenerateMatrix();
  const update = useUpdateMatrix();
  const checkCoherence = useCheckCoherence();

  const handleGenerate = () => {
    generate.mutate(
      { id: id! },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetMatrixQueryKey(id!) });
          toast({
            title: "Matrice générée",
            description: "Votre Matrice Narrative a été générée avec succès.",
          });
        },
        onError: () =>
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de générer la matrice.",
          }),
      },
    );
  };

  const handleUpdate = (field: string, value: string | string[]) => {
    if (!matrix) return;
    update.mutate(
      { id: id!, data: { ...matrix, [field]: value } as Parameters<typeof update.mutate>[0]["data"] },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getGetMatrixQueryKey(id!) }) },
    );
  };

  const handleCheckCoherence = () => {
    checkCoherence.mutate(
      { id: id! },
      {
        onSuccess: (result) => {
          setCoherenceResult(result);
          toast({
            title: result.isCoherent ? "Matrice cohérente" : "Problèmes détectés",
            description: `Score de cohérence : ${result.score}/100`,
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-matrice-encre" />
        </div>
      </AppLayout>
    );
  }

  if (!matrix) {
    return (
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
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-matrice-ivoire text-matrice-encre">
        <div className="border-b border-matrice-sable bg-white">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-matrice-or-fonce">
                Module I · Fondations
              </p>
              <h1 className="font-serif text-2xl font-bold text-matrice-encre">Matrice Narrative</h1>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckCoherence}
                disabled={checkCoherence.isPending}
                className="border-matrice-sable bg-white text-matrice-encre hover:bg-matrice-sable/60"
              >
                {checkCoherence.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                )}
                Cohérence
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={generate.isPending}
                className="bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit"
              >
                {generate.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                Régénérer
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {coherenceResult && (
            <div
              className={cn(
                "rounded-2xl border p-5",
                coherenceResult.isCoherent
                  ? "border-matrice-success/30 bg-matrice-success/10"
                  : "border-matrice-warning/40 bg-matrice-warning/10",
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                {coherenceResult.isCoherent ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-matrice-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-matrice-warning" />
                )}
                <span className="font-semibold text-matrice-encre">
                  Score de cohérence : {coherenceResult.score}/100
                </span>
                <div className="ml-2 h-1.5 flex-1 overflow-hidden rounded-full bg-matrice-sable">
                  <div
                    className={cn("h-full rounded-full", coherenceResult.isCoherent ? "bg-matrice-success" : "bg-matrice-warning")}
                    style={{ width: `${coherenceResult.score}%` }}
                  />
                </div>
              </div>
              {coherenceResult.issues.length > 0 && (
                <div className="mb-3 space-y-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-matrice-or-fonce">
                    Points à retravailler
                  </p>
                  {coherenceResult.issues.map((issue, idx) => (
                    <p key={idx} className="border-l border-matrice-warning/60 pl-3 text-sm text-matrice-encre/80">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}
              {coherenceResult.suggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-matrice-or-fonce">Suggestions</p>
                  {coherenceResult.suggestions.map((suggestion, idx) => (
                    <p key={idx} className="border-l border-matrice-or-fonce/50 pl-3 text-sm text-matrice-encre/80">
                      • {suggestion}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl border border-matrice-sable bg-white shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-matrice-sable/40 blur-[60px]" />
            <div className="relative z-10 p-5 sm:p-8 md:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-matrice-or-fonce">Logline</div>
                <div className="h-px flex-1 bg-matrice-sable" />
                <div className="text-[9px] uppercase tracking-wider text-matrice-encre/60">La phrase qui résume tout</div>
              </div>
              <EditableField
                label=""
                value={matrix.logline ?? ""}
                onSave={(value) => handleUpdate("logline", value)}
                multiline
                className="font-serif text-xl italic leading-relaxed text-matrice-encre md:text-2xl"
              />

              <div className="mt-8 grid grid-cols-1 gap-6 border-t border-matrice-sable pt-8 md:grid-cols-2">
                <div>
                  <FieldLabel>Concept central</FieldLabel>
                  <EditableField
                    label=""
                    value={matrix.centralConcept ?? ""}
                    onSave={(value) => handleUpdate("centralConcept", value)}
                    multiline
                    className="text-sm leading-relaxed text-matrice-encre/90"
                  />
                </div>
                <div>
                  <FieldLabel>Pitch court</FieldLabel>
                  <EditableField
                    label=""
                    value={matrix.shortPitch ?? ""}
                    onSave={(value) => handleUpdate("shortPitch", value)}
                    multiline
                    className="text-sm leading-relaxed text-matrice-encre/90"
                  />
                </div>
              </div>
            </div>
          </div>

          <Section label="Synopsis" accent="violet">
            <EditableField
              label="Synopsis long"
              value={matrix.longSynopsis ?? ""}
              onSave={(value) => handleUpdate("longSynopsis", value)}
              multiline
              className="text-sm leading-relaxed text-matrice-encre/90"
            />
          </Section>

          <Section label="Thèmes & Symboles" accent="indigo">
            <div className="space-y-5">
              <div>
                <FieldLabel>Thèmes</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {matrix.themes?.map((theme, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-matrice-sable bg-matrice-ivoire px-3 py-1.5 text-xs font-semibold text-matrice-or-fonce"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Motifs symboliques</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {matrix.symbolicMotifs?.map((motif, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-matrice-sable bg-white px-3 py-1.5 text-xs text-matrice-encre/80"
                    >
                      {motif}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section label="Conflit & Personnages" accent="blue">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <FieldLabel>Protagoniste</FieldLabel>
                <ReadableField value={matrix.protagonist ?? ""} onSave={(value) => handleUpdate("protagonist", value)} />
              </div>
              <div>
                <FieldLabel>Antagoniste / Force d'opposition</FieldLabel>
                <ReadableField value={matrix.antagonist ?? ""} onSave={(value) => handleUpdate("antagonist", value)} />
              </div>
            </div>
            <div className="mt-6">
              <FieldLabel>Conflit central</FieldLabel>
              <ReadableField value={matrix.centralConflict ?? ""} onSave={(value) => handleUpdate("centralConflict", value)} />
            </div>
            <div className="mt-6">
              <FieldLabel>Enjeux émotionnels</FieldLabel>
              <ReadableField value={matrix.emotionalStakes ?? ""} onSave={(value) => handleUpdate("emotionalStakes", value)} />
            </div>
          </Section>

          <Section label="Univers & Règles" accent="amber">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <FieldLabel>Monde visible</FieldLabel>
                <ReadableField value={matrix.visibleWorld ?? ""} onSave={(value) => handleUpdate("visibleWorld", value)} />
              </div>
              <div>
                <FieldLabel>Forces invisibles</FieldLabel>
                <ReadableField value={matrix.invisibleForces ?? ""} onSave={(value) => handleUpdate("invisibleForces", value)} />
              </div>
              <div>
                <FieldLabel>Règles temporelles</FieldLabel>
                <ReadableField value={matrix.temporalRules ?? ""} onSave={(value) => handleUpdate("temporalRules", value)} />
              </div>
              <div>
                <FieldLabel>Règles spatiales</FieldLabel>
                <ReadableField value={matrix.spatialRules ?? ""} onSave={(value) => handleUpdate("spatialRules", value)} />
              </div>
            </div>
          </Section>

          {matrix.universeLaws && matrix.universeLaws.length > 0 && (
            <Section label="Lois de l'univers" accent="emerald">
              <div className="space-y-2">
                {matrix.universeLaws.map((law, idx) => (
                  <div key={idx} className="flex gap-3 rounded-xl border border-matrice-sable bg-matrice-ivoire p-3">
                    <span className="mt-0.5 w-4 flex-shrink-0 text-[10px] font-black text-matrice-or-fonce">{idx + 1}</span>
                    <p className="text-sm leading-relaxed text-matrice-encre/85">{law}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section label="Secrets & Fins possibles" accent="rose">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <FieldLabel>Secrets</FieldLabel>
                <div className="space-y-2">
                  {matrix.secrets?.map((secret, idx) => (
                    <p key={idx} className="border-l-2 border-matrice-terracotta/50 pl-3 text-sm leading-relaxed text-matrice-encre/85">
                      {secret}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Fins possibles</FieldLabel>
                <div className="space-y-2">
                  {matrix.possibleEndings?.map((ending, idx) => (
                    <p key={idx} className="border-l-2 border-matrice-bleu-nuit/40 pl-3 text-sm leading-relaxed text-matrice-encre/85">
                      {ending}
                    </p>
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

function ReadableField({ value, onSave }: { value: string; onSave: (value: string) => void }) {
  return (
    <EditableField
      label=""
      value={value}
      onSave={onSave}
      multiline
      className="text-sm leading-relaxed text-matrice-encre/90"
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-matrice-encre">{children}</p>;
}

function Section({
  label,
  accent,
  children,
}: {
  label: string;
  accent: "violet" | "indigo" | "blue" | "amber" | "emerald" | "rose";
  children: React.ReactNode;
}) {
  const accentMap = {
    violet: { dot: "bg-matrice-or-fonce", text: "text-matrice-or-fonce" },
    indigo: { dot: "bg-matrice-bleu-nuit", text: "text-matrice-bleu-nuit" },
    blue: { dot: "bg-matrice-bleu-nuit", text: "text-matrice-bleu-nuit" },
    amber: { dot: "bg-matrice-warning", text: "text-matrice-or-fonce" },
    emerald: { dot: "bg-matrice-success", text: "text-matrice-success" },
    rose: { dot: "bg-matrice-terracotta", text: "text-matrice-terracotta" },
  };
  const currentAccent = accentMap[accent];

  return (
    <div className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-matrice-sable px-6 py-4">
        <div className={cn("h-1.5 w-1.5 rounded-full", currentAccent.dot)} />
        <h2 className={cn("text-xs font-bold uppercase tracking-[0.18em]", currentAccent.text)}>{label}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
