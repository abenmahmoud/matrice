import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListRelationships, useGenerateRelationships, getListRelationshipsQueryKey
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function RelationshipsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: relationships, isLoading } = useListRelationships(id!, {
    query: { enabled: !!id, queryKey: getListRelationshipsQueryKey(id!) }
  });
  const generate = useGenerateRelationships();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListRelationshipsQueryKey(id!) });
        toast({ title: "Relations générées" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer les relations. Créez d'abord des personnages." })
    });
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Relations</h1>
            <p className="text-muted-foreground mt-1">Les liens émotionnels entre vos personnages</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Générer les relations
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !relationships || relationships.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune relation</h3>
            <p className="text-muted-foreground mb-6">Générez les relations depuis vos personnages existants.</p>
            <Button onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Générer les relations
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {relationships.map((rel, i) => (
              <motion.div key={rel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-right">
                        <span className="font-semibold text-foreground">{rel.characterAName}</span>
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary whitespace-nowrap">
                        {rel.relationshipType}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-foreground">{rel.characterBName}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rel.emotionalTension && (
                      <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tension émotionnelle</p><p className="text-sm text-foreground/80">{rel.emotionalTension}</p></div>
                    )}
                    {rel.hiddenTruth && (
                      <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Vérité cachée</p><p className="text-sm text-foreground/80">{rel.hiddenTruth}</p></div>
                    )}
                    {rel.conflict && (
                      <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Conflit</p><p className="text-sm text-foreground/80">{rel.conflict}</p></div>
                    )}
                    {rel.evolution && (
                      <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Évolution</p><p className="text-sm text-foreground/80">{rel.evolution}</p></div>
                    )}
                    {rel.symbolicMeaning && (
                      <div className="md:col-span-2"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Signification symbolique</p><p className="text-sm text-foreground/80">{rel.symbolicMeaning}</p></div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
