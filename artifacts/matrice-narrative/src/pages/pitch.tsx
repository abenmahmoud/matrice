import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetPitch, useGeneratePitch, getGetPitchQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { EditableField } from "@/components/EditableField";

export default function PitchPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: pitch, isLoading } = useGetPitch(id!, {
    query: { enabled: !!id, queryKey: getGetPitchQueryKey(id!) }
  });
  const generate = useGeneratePitch();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetPitchQueryKey(id!) });
        toast({ title: "Dossier Pitch généré" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!pitch) return (
    <AppLayout>
      <GenerateEmptyState
        title="Atelier Pitch"
        description="Créez votre dossier de pitch professionnel : note d'intention, direction visuelle, arguments de vente et comparables."
        buttonLabel="Générer le dossier Pitch"
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
            <h1 className="text-3xl font-serif font-bold">Atelier Pitch</h1>
            <p className="text-muted-foreground mt-1">Dossier professionnel de présentation</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Titre", value: pitch.title ?? "" },
              { label: "Format", value: pitch.format ?? "" },
              { label: "Genre", value: pitch.genre ?? "" },
              { label: "Public", value: pitch.targetAudience ?? "" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <SectionCard title="Arguments de vente" icon={<Star className="w-4 h-4 text-yellow-400" />}>
          <div className="space-y-2">
            {pitch.sellingPoints?.map((p, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-primary font-bold text-sm mt-0.5">{i + 1}.</span>
                <p className="text-sm text-foreground/80">{p}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notes d'auteur & d'intention">
          <EditableField label="Note d'auteur" value={pitch.authorNote ?? ""} onSave={() => {}} multiline />
          <EditableField label="Note d'intention" value={pitch.intentionNote ?? ""} onSave={() => {}} multiline />
          <EditableField label="Pourquoi maintenant" value={pitch.whyNow ?? ""} onSave={() => {}} multiline />
        </SectionCard>

        <SectionCard title="Direction visuelle">
          <p className="text-sm text-foreground/80 leading-relaxed">{pitch.visualDirection ?? ""}</p>
        </SectionCard>

        <SectionCard title="Univers & Personnages">
          <EditableField label="Personnages" value={pitch.characters ?? ""} onSave={() => {}} multiline />
          <EditableField label="Monde" value={pitch.world ?? ""} onSave={() => {}} multiline />
          <EditableField label="Arc narratif" value={pitch.filmSeasonArc ?? ""} onSave={() => {}} multiline />
        </SectionCard>

        {pitch.comparableReferences && pitch.comparableReferences.length > 0 && (
          <SectionCard title="Références comparables">
            <div className="flex flex-wrap gap-2">
              {pitch.comparableReferences.map((r, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">{r}</span>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}
