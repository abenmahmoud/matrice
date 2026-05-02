import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetBookOutline, useGenerateBookOutline, getGetBookOutlineQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { useState } from "react";
import { motion } from "framer-motion";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const { data: book, isLoading } = useGetBookOutline(id!, {
    query: { enabled: !!id, queryKey: getGetBookOutlineQueryKey(id!) }
  });
  const generate = useGenerateBookOutline();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetBookOutlineQueryKey(id!) });
        toast({ title: "Plan du livre généré" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!book) return (
    <AppLayout>
      <GenerateEmptyState
        title="Atelier Livre"
        description="Générez le plan complet de votre livre : titres, synopsis, table des matières, structure en actes et résumés de chapitres."
        buttonLabel="Créer le plan du livre"
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
            <h1 className="text-3xl font-serif font-bold">Atelier Livre</h1>
            <p className="text-muted-foreground mt-1">Structure et plan de votre manuscrit</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <SectionCard title="Idées de titres" icon={<BookOpen className="w-4 h-4 text-primary" />}>
          <div className="flex flex-wrap gap-2">
            {book.titleIdeas?.map((t, i) => (
              <span key={i} className="px-4 py-2 rounded-lg border border-border/50 bg-background/30 text-sm font-medium hover:border-primary/50 cursor-pointer transition-colors">{t}</span>
            ))}
          </div>
        </SectionCard>

        {book.backCoverPitch && (
          <SectionCard title="Pitch quatrième de couverture">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{book.backCoverPitch}</p>
          </SectionCard>
        )}

        <SectionCard title="Synopsis">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Synopsis court</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{book.shortSynopsis}</p>
          </div>
          {book.longSynopsis && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Synopsis long</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{book.longSynopsis}</p>
            </div>
          )}
        </SectionCard>

        {book.structure && (
          <SectionCard title="Structure narrative">
            <p className="text-sm text-foreground/80">{book.structure}</p>
            {book.tableOfContents && book.tableOfContents.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Table des matières</p>
                {book.tableOfContents.map((t, i) => (
                  <p key={i} className="text-sm text-foreground/70 py-1 border-b border-border/20 last:border-0">{t}</p>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        <SectionCard title="Chapitres">
          <div className="space-y-2">
            {book.chapters?.map((ch, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <div
                  className="rounded-lg border border-border/40 bg-background/20 p-4 cursor-pointer hover:bg-background/40 transition-colors"
                  onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary w-8 text-center py-0.5 rounded bg-primary/10">{ch.number}</span>
                      <span className="font-medium text-sm">{ch.title}</span>
                    </div>
                    {expandedChapter === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  {expandedChapter === i && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-sm text-foreground/80 leading-relaxed">{ch.summary}</p>
                      {ch.draftContent && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Brouillon</p>
                          <p className="text-sm text-foreground/70 italic whitespace-pre-wrap">{ch.draftContent}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
