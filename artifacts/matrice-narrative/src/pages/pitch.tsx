import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetPitch, useGeneratePitch, getGetPitchQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Star, Award, BookOpen, Target, TrendingUp, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { EditableField } from "@/components/EditableField";

type ComparableRef =
  | string
  | { title: string; author?: string; year?: string; publisher?: string; commercialResult?: string; why?: string };

type SellingPoint = string | { point: string; argument?: string };

function CncBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
      <Award className="w-3 h-3 text-amber-400 shrink-0" />
      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">CNC · SACD · Festivals</span>
    </div>
  );
}

function ComparableCard({ ref: r, index }: { ref: ComparableRef; index: number }) {
  if (typeof r === "string") {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-background/30 border border-border/30">
        <span className="text-xs font-bold text-primary/60 mt-0.5 shrink-0">{index + 1}.</span>
        <p className="text-sm text-foreground/80">{r}</p>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-xl bg-background/30 border border-border/40 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-foreground">{r.title}</p>
          {(r.author || r.year) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.author}{r.author && r.year ? " · " : ""}{r.year}{r.publisher ? ` · ${r.publisher}` : ""}
            </p>
          )}
        </div>
        {r.commercialResult && (
          <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded shrink-0">
            {r.commercialResult}
          </span>
        )}
      </div>
      {r.why && (
        <p className="text-xs text-foreground/60 italic border-l-2 border-primary/20 pl-2.5 leading-relaxed">{r.why}</p>
      )}
    </div>
  );
}

function SellingPointItem({ sp, index }: { sp: SellingPoint; index: number }) {
  if (typeof sp === "string") {
    return (
      <div className="flex gap-3 items-start">
        <span className="text-primary font-bold text-sm mt-0.5">{index + 1}.</span>
        <p className="text-sm text-foreground/80">{sp}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-start">
      <span className="text-primary font-bold text-sm mt-0.5 shrink-0">{index + 1}.</span>
      <div>
        <p className="text-sm font-medium text-foreground/90">{sp.point}</p>
        {sp.argument && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sp.argument}</p>}
      </div>
    </div>
  );
}

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
        description="Dossier professionnel conforme CNC · SACD · Festivals : note d'auteur, direction visuelle, comparables réels avec résultats commerciaux, stratégie de soumission."
        buttonLabel="Générer le dossier Pitch"
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const comparables = (pitch.comparableReferences ?? []) as ComparableRef[];
  const sellingPoints = (pitch.sellingPoints ?? []) as SellingPoint[];
  const pitchExt = pitch as unknown as Record<string, string>;

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Atelier Pitch</h1>
            <p className="text-muted-foreground mt-1">Dossier professionnel de présentation</p>
            <div className="mt-2">
              <CncBadge />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        {/* Identity card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
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
          {(pitchExt.logline || pitchExt.tagline) && (
            <div className="border-t border-border/30 pt-4 space-y-3">
              {pitchExt.tagline && (
                <div>
                  <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider mb-1">Accroche</p>
                  <p className="text-base font-serif font-bold text-foreground italic">"{pitchExt.tagline}"</p>
                </div>
              )}
              {pitchExt.logline && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Logline</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{pitchExt.logline}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selling points */}
        {sellingPoints.length > 0 && (
          <SectionCard title="Arguments de vente" icon={<Star className="w-4 h-4 text-yellow-400" />}>
            <div className="space-y-3">
              {sellingPoints.map((sp, i) => (
                <SellingPointItem key={i} sp={sp} index={i} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* Author & intention notes */}
        <SectionCard title="Notes d'auteur & d'intention" icon={<BookOpen className="w-4 h-4 text-violet-400" />}>
          <EditableField label="Note d'auteur" value={pitch.authorNote ?? ""} onSave={() => {}} multiline />
          <EditableField label="Note d'intention" value={pitch.intentionNote ?? ""} onSave={() => {}} multiline />
          <EditableField label="Pourquoi maintenant" value={pitch.whyNow ?? ""} onSave={() => {}} multiline />
        </SectionCard>

        {/* Visual direction */}
        {pitch.visualDirection && (
          <SectionCard title="Direction visuelle">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{pitch.visualDirection}</p>
          </SectionCard>
        )}

        {/* Universe & characters */}
        <SectionCard title="Univers & Personnages">
          <EditableField label="Personnages" value={pitch.characters ?? ""} onSave={() => {}} multiline />
          <EditableField label="Monde" value={pitch.world ?? ""} onSave={() => {}} multiline />
          <EditableField label="Arc narratif" value={pitch.filmSeasonArc ?? ""} onSave={() => {}} multiline />
        </SectionCard>

        {/* Budget category */}
        {pitchExt.budgetCategory && (
          <SectionCard title="Catégorie budgétaire" icon={<TrendingUp className="w-4 h-4 text-green-400" />}>
            <p className="text-sm text-foreground/80 leading-relaxed">{pitchExt.budgetCategory}</p>
          </SectionCard>
        )}

        {/* Comparable references */}
        {comparables.length > 0 && (
          <SectionCard title="Références comparables" icon={<Target className="w-4 h-4 text-blue-400" />}>
            <div className="space-y-3">
              {comparables.map((r, i) => (
                <ComparableCard key={i} ref={r} index={i} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* Submission strategy */}
        {pitchExt.submissionStrategy && (
          <SectionCard title="Stratégie de soumission" icon={<Map className="w-4 h-4 text-amber-400" />}>
            <div className="flex items-center gap-2 mb-3">
              <CncBadge />
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{pitchExt.submissionStrategy}</p>
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}
