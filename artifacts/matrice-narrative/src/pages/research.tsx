import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetResearch, useGenerateResearchNotes, getGetResearchQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, BookOpen, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";

export default function ResearchPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: research, isLoading } = useGetResearch(id!, {
    query: { enabled: !!id, queryKey: getGetResearchQueryKey(id!) }
  });
  const generate = useGenerateResearchNotes();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetResearchQueryKey(id!) });
        toast({ title: "Recherche générée" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!research) return (
    <AppLayout>
      <GenerateEmptyState
        title="Moteur de Recherche Vivant"
        description="Analysez les références, identifiez les tendances, détectez les risques de clichés et trouvez les opportunités d'originalité pour votre projet."
        buttonLabel="Générer la Recherche"
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
            <h1 className="text-3xl font-serif font-bold">Moteur de Recherche Vivant</h1>
            <p className="text-muted-foreground mt-1">Analyse des références et du contexte créatif</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <SectionCard title="Œuvres de référence" icon={<BookOpen className="w-4 h-4 text-primary" />}>
          <div className="space-y-3">
            {research.referenceWorks?.map((ref, i) => (
              <div key={i} className="rounded-lg border border-border/40 p-3 bg-background/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{ref.title}</p>
                    {ref.author && <p className="text-xs text-muted-foreground">{ref.author} {ref.medium ? `· ${ref.medium}` : ""}</p>}
                  </div>
                </div>
                <p className="text-sm text-foreground/70 mt-2">{ref.relevance}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Signaux de succès" icon={<TrendingUp className="w-4 h-4 text-green-400" />}>
            {research.successSignals?.map((s, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-green-500/30">{s}</p>)}
          </SectionCard>
          <SectionCard title="Tendances actuelles" icon={<TrendingUp className="w-4 h-4 text-chart-2" />}>
            {research.currentTrends?.map((t, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-2/30">{t}</p>)}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Risques de cliché" icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />}>
            {research.clicheRisks?.map((r, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-yellow-500/30">{r}</p>)}
          </SectionCard>
          <SectionCard title="Opportunités d'originalité" icon={<Lightbulb className="w-4 h-4 text-primary" />}>
            {research.originalityOpportunities?.map((o, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-primary/30">{o}</p>)}
          </SectionCard>
        </div>

        <SectionCard title="Notes critiques">
          {research.criticalNotes?.map((n, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-border/50">{n}</p>)}
        </SectionCard>

        <SectionCard title="Mécaniques abstraites à utiliser">
          {research.abstractMechanics?.map((m, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-3/30">{m}</p>)}
        </SectionCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard title="Patterns d'humour">
            {research.humorPatterns?.map((p, i) => <p key={i} className="text-sm text-foreground/80">{p}</p>)}
          </SectionCard>
          <SectionCard title="Patterns de suspense">
            {research.suspensePatterns?.map((p, i) => <p key={i} className="text-sm text-foreground/80">{p}</p>)}
          </SectionCard>
          <SectionCard title="Déclencheurs de larmes">
            {research.tearTriggers?.map((t, i) => <p key={i} className="text-sm text-foreground/80">{t}</p>)}
          </SectionCard>
        </div>

        {research.creationNotes && (
          <SectionCard title="Notes de création">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{research.creationNotes}</p>
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}
