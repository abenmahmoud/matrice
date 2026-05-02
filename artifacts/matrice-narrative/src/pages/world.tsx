import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetWorld, useGenerateWorld, useUpdateWorld, getGetWorldQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Globe2, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { motion } from "framer-motion";

export default function WorldPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: world, isLoading } = useGetWorld(id!, {
    query: { enabled: !!id, queryKey: getGetWorldQueryKey(id!) }
  });
  const generate = useGenerateWorld();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetWorldQueryKey(id!) });
        toast({ title: "Monde & Temporalité générés" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer le monde." })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!world) return (
    <AppLayout>
      <GenerateEmptyState
        title="Monde & Temporalité"
        description="Construisez les espaces, atmosphères, règles temporelles et événements clés de votre univers narratif."
        buttonLabel="Générer le Monde"
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
            <h1 className="text-3xl font-serif font-bold">Monde & Temporalité</h1>
            <p className="text-muted-foreground mt-1">Les espaces et le temps de votre univers</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <SectionCard title="Lieux" icon={<MapPin className="w-4 h-4 text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {world.locations?.map((loc, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }} className="rounded-lg border border-border/50 bg-background/30 p-4">
                <h4 className="font-semibold text-sm mb-1">{loc.name}</h4>
                <p className="text-sm text-foreground/70 mb-2">{loc.description}</p>
                {loc.atmosphere && <p className="text-xs text-muted-foreground italic">{loc.atmosphere}</p>}
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Atmosphères">
          <div className="flex flex-wrap gap-2">
            {world.atmospheres?.map((a, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">{a}</span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Règles du temps" icon={<Clock className="w-4 h-4 text-chart-2" />}>
          <p className="text-sm text-foreground/80 leading-relaxed">{world.temporalRules}</p>
          {world.parallelTimelines && world.parallelTimelines.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Timelines parallèles</p>
              {world.parallelTimelines.map((t, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-2/30">{t}</p>)}
            </div>
          )}
          {world.dreamLayers && world.dreamLayers.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Couches de rêve</p>
              {world.dreamLayers.map((d, i) => <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-chart-4/30">{d}</p>)}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Timeline des événements">
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border/50" />
            <div className="space-y-4 pl-10">
              {world.timelineEvents?.map((ev, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="relative">
                  <div className="absolute -left-7 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <p className="text-xs font-medium text-primary mb-0.5">{ev.date}</p>
                  <p className="text-sm font-medium">{ev.event}</p>
                  {ev.significance && <p className="text-xs text-muted-foreground mt-0.5">{ev.significance}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </SectionCard>

        {world.forbiddenRules && world.forbiddenRules.length > 0 && (
          <SectionCard title="Règles interdites">
            {world.forbiddenRules.map((r, i) => (
              <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-destructive/30">{r}</p>
            ))}
          </SectionCard>
        )}

        <SectionCard title="Logique cause/effet">
          <p className="text-sm text-foreground/80 leading-relaxed">{world.causeEffectLogic}</p>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
