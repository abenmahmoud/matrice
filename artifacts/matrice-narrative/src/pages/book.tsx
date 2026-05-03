import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetBookOutline, useGenerateBookOutline, getGetBookOutlineQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, BookOpen, ChevronDown, ChevronUp, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { useState } from "react";
import { motion } from "framer-motion";

type BookChapter = {
  number: number;
  title: string;
  summary: string;
  pov?: string;
  location?: string;
  timeframe?: string;
  emotionalArc?: string;
  keyScene?: string;
  closingHook?: string;
  narrativePurpose?: string;
  voiceNote?: string;
  draftContent?: string;
};

const PURPOSE_COLORS: Record<string, string> = {
  "Exposition": "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Complication": "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  "Révélation": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  "Climax": "text-red-400 bg-red-500/10 border-red-500/30",
  "Résolution": "text-green-400 bg-green-500/10 border-green-500/30",
};

function getPurposeStyle(purpose?: string) {
  if (!purpose) return "text-muted-foreground bg-muted/20 border-border/30";
  for (const [key, val] of Object.entries(PURPOSE_COLORS)) {
    if (purpose.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "text-primary/70 bg-primary/5 border-primary/20";
}

function ChapterCard({ ch, index }: { ch: BookChapter; index: number }) {
  const [open, setOpen] = useState(false);
  const hasDetails = ch.pov || ch.location || ch.timeframe || ch.emotionalArc || ch.keyScene || ch.closingHook || ch.voiceNote;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
      <div className="rounded-xl border border-border/40 bg-background/20 overflow-hidden hover:bg-background/30 transition-colors">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <span className="text-xs font-bold text-primary min-w-[2rem] text-center py-1 rounded bg-primary/10">
            {ch.number}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{ch.title}</p>
            {ch.narrativePurpose && !open && (
              <p className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getPurposeStyle(ch.narrativePurpose)}`}>
                {ch.narrativePurpose.split("(")[0].trim()}
              </p>
            )}
          </div>
          {hasDetails && (
            open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Expanded content */}
        {open && (
          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/30">
            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {ch.pov && (
                <div className="bg-background/40 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">PDV</p>
                  <p className="text-xs text-foreground/80">{ch.pov}</p>
                </div>
              )}
              {ch.location && (
                <div className="bg-background/40 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Lieu</p>
                  <p className="text-xs text-foreground/80">{ch.location}</p>
                </div>
              )}
              {ch.timeframe && (
                <div className="bg-background/40 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Moment</p>
                  <p className="text-xs text-foreground/80">{ch.timeframe}</p>
                </div>
              )}
              {ch.narrativePurpose && (
                <div className="bg-background/40 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Fonction</p>
                  <p className={`text-xs font-medium ${getPurposeStyle(ch.narrativePurpose).split(" ")[0]}`}>
                    {ch.narrativePurpose.split("(")[0].trim()}
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <p className="text-sm text-foreground/80 leading-relaxed">{ch.summary}</p>

            {/* Emotional arc */}
            {ch.emotionalArc && (
              <div className="flex items-center gap-2 bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-2">
                <span className="text-xs text-violet-400 font-medium shrink-0">Arc émotionnel</span>
                <span className="text-xs text-foreground/70 italic">→ {ch.emotionalArc}</span>
              </div>
            )}

            {/* Key scene + closing hook side by side */}
            {(ch.keyScene || ch.closingHook) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ch.keyScene && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">Scène clé</p>
                    <p className="text-xs text-foreground/70">{ch.keyScene}</p>
                  </div>
                )}
                {ch.closingHook && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider mb-1">⚡ Accroche finale</p>
                    <p className="text-xs text-foreground/70">{ch.closingHook}</p>
                  </div>
                )}
              </div>
            )}

            {/* Voice note */}
            {ch.voiceNote && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-border/40 pl-3">{ch.voiceNote}</p>
            )}

            {/* Draft content */}
            {ch.draftContent && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Brouillon</p>
                <p className="text-sm text-foreground/70 font-serif italic whitespace-pre-wrap leading-relaxed">{ch.draftContent}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

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
        description="Plan complet du manuscrit : titres, synopsis, structure narrative, voix narrative, ligne d'ouverture/fermeture, et 24 chapitres détaillés avec PDV, arc émotionnel, scène clé et accroche."
        buttonLabel="Créer le plan du livre"
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const chapters = (book.chapters ?? []) as unknown as BookChapter[];
  const titleIdeas = book.titleIdeas ?? [];

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

        {/* Title ideas */}
        <SectionCard title="Idées de titres" icon={<BookOpen className="w-4 h-4 text-primary" />}>
          <div className="flex flex-wrap gap-2">
            {titleIdeas.map((t, i) => {
              const title = typeof t === "string" ? t : (t as { title: string }).title;
              const tone = typeof t === "object" ? (t as { tone?: string }).tone : undefined;
              const why = typeof t === "object" ? (t as { why?: string }).why : undefined;
              return (
                <div key={i} className="group relative">
                  <span className="px-4 py-2 rounded-lg border border-border/50 bg-background/30 text-sm font-medium hover:border-primary/50 cursor-pointer transition-colors block">
                    {title}
                    {tone && <span className="ml-2 text-xs text-primary/60 italic">({tone})</span>}
                  </span>
                  {why && (
                    <div className="absolute bottom-full left-0 mb-1 bg-card border border-border/50 rounded-lg px-3 py-2 text-xs text-muted-foreground max-w-[240px] z-10 hidden group-hover:block shadow-lg">
                      {why}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Narrative signature */}
        {((book as unknown as Record<string, string>).narrativeVoice || (book as unknown as Record<string, string>).openingLine || (book as unknown as Record<string, string>).closingLine) && (
          <SectionCard title="Signature narrative">
            {(book as unknown as Record<string, string>).narrativeVoice && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Voix narrative</p>
                <p className="text-sm text-foreground/80">{(book as unknown as Record<string, string>).narrativeVoice}</p>
              </div>
            )}
            {(book as unknown as Record<string, string>).openingLine && (
              <Card className="bg-background/30 border-primary/20 mt-3">
                <CardContent className="pt-4 pb-3">
                  <div className="flex gap-2">
                    <Quote className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-primary/70 uppercase tracking-wider font-semibold mb-1">Ligne d'ouverture</p>
                      <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">{(book as unknown as Record<string, string>).openingLine}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {(book as unknown as Record<string, string>).closingLine && (
              <Card className="bg-background/30 border-muted/20 mt-2">
                <CardContent className="pt-4 pb-3">
                  <div className="flex gap-2">
                    <Quote className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">Ligne de fermeture</p>
                      <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">{(book as unknown as Record<string, string>).closingLine}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </SectionCard>
        )}

        {/* Back cover pitch */}
        {book.backCoverPitch && (
          <SectionCard title="Pitch quatrième de couverture">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{book.backCoverPitch}</p>
          </SectionCard>
        )}

        {/* Synopsis */}
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

        {/* Structure */}
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

        {/* Chapters */}
        <SectionCard title={`Chapitres (${chapters.length})`}>
          <div className="space-y-2">
            {chapters.map((ch, i) => (
              <ChapterCard key={i} ch={ch} index={i} />
            ))}
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
