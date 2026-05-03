import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetBookOutline,
  useGenerateBookOutline,
  useUpdateBookOutline,
  useGenerateChapterProse,
  useSaveContentVersion,
  getGetBookOutlineQueryKey,
  type BookOutline,
  type SaveVersionInput,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, RefreshCw, BookOpen, ChevronDown, ChevronUp,
  Quote, Pen, Sparkles, Save, X, BookText, Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionCard } from "@/components/SectionCard";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { VersionHistoryDrawer } from "@/components/VersionHistoryDrawer";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ─── Prose Editor ───────────────────────────────────────────────────────────

function ProseEditor({
  ch,
  chapterIndex,
  projectId,
  narrativeVoice,
  allChapters,
  onClose,
  onSaved,
}: {
  ch: BookChapter;
  chapterIndex: number;
  projectId: string;
  narrativeVoice?: string;
  allChapters: BookChapter[];
  onClose: () => void;
  onSaved: (prose: string) => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState(ch.draftContent ?? "");
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateProse = useGenerateChapterProse();
  const updateBook = useUpdateBookOutline();
  const saveVersion = useSaveContentVersion();

  const saveNow = useCallback(
    (value: string) => {
      const updated = allChapters.map((c, i) =>
        i === chapterIndex ? { ...c, draftContent: value } : c
      );
      updateBook.mutate(
        { id: projectId, data: { chapters: updated } as unknown as BookOutline },
        {
          onSuccess: () => {
            setSaved(true);
            onSaved(value);
          },
        }
      );
    },
    [allChapters, chapterIndex, projectId, updateBook, onSaved]
  );

  const handleChange = (val: string) => {
    setText(val);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNow(val), 2500);
  };

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const snapshotThenGenerate = () => {
    if (text.trim().length > 50) {
      const snapBody: SaveVersionInput = {
        contentType: "chapter-prose",
        contentKey: String(ch.number),
        label: `Avant génération — Ch.${ch.number} ${ch.title}`,
        data: { prose: text } as unknown as Record<string, unknown>,
        wordCount: wordCount(text),
      };
      saveVersion.mutate({ id: projectId, data: snapBody }, { onSettled: () => doGenerate() });
    } else {
      doGenerate();
    }
  };

  const doGenerate = () => {
    generateProse.mutate(
      {
        id: projectId,
        index: chapterIndex,
        data: {
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          pov: ch.pov,
          location: ch.location,
          timeframe: ch.timeframe,
          summary: ch.summary,
          emotionalArc: ch.emotionalArc,
          keyScene: ch.keyScene,
          closingHook: ch.closingHook,
          narrativeVoice,
        },
      },
      {
        onSuccess: (res) => {
          const prose = res.prose ?? "";
          setText(prose);
          setSaved(false);
          saveNow(prose);
          toast({ title: "Chapitre rédigé", description: `${res.wordCount ?? wordCount(prose)} mots générés` });
        },
        onError: () => toast({ variant: "destructive", title: "Erreur de génération" }),
      }
    );
  };

  const handleRestore = (data: Record<string, unknown>) => {
    const prose = (data.prose as string) ?? "";
    setText(prose);
    setSaved(false);
    saveNow(prose);
    toast({ title: "Version restaurée", description: `${wordCount(prose)} mots rechargés` });
  };

  const wc = wordCount(text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{ch.number}</span>
          <h2 className="font-serif text-lg font-semibold truncate">{ch.title}</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Word count */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="w-3 h-3" />
            <span className={wc >= 900 ? "text-green-400 font-semibold" : ""}>{wc} mots</span>
            {wc > 0 && wc < 900 && <span className="text-muted-foreground/60">/ 900 min</span>}
          </div>
          {/* Save status */}
          <span className={`text-xs ${saved ? "text-green-400" : "text-amber-400"}`}>
            {updateBook.isPending ? "Sauvegarde…" : saved ? "Sauvegardé" : "Non sauvegardé"}
          </span>
          {/* Version history */}
          <VersionHistoryDrawer
            projectId={projectId}
            contentType="chapter-prose"
            contentKey={String(ch.number)}
            onRestore={handleRestore}
            triggerLabel="Historique"
          />
          {/* Generate */}
          <Button
            size="sm"
            onClick={snapshotThenGenerate}
            disabled={generateProse.isPending || saveVersion.isPending}
            className="bg-primary/90 hover:bg-primary text-white text-xs gap-1.5"
          >
            {generateProse.isPending
              ? <><Loader2 className="w-3 h-3 animate-spin" />Rédaction en cours…</>
              : saveVersion.isPending
              ? <><Loader2 className="w-3 h-3 animate-spin" />Sauvegarde…</>
              : <><Sparkles className="w-3 h-3" />Générer avec l'IA</>}
          </Button>
          {/* Save now */}
          <Button size="sm" variant="outline" onClick={() => saveNow(text)} disabled={saved || updateBook.isPending} className="text-xs gap-1.5">
            <Save className="w-3 h-3" />Sauvegarder
          </Button>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Context sidebar */}
        <aside className="w-64 shrink-0 border-r border-border/30 overflow-y-auto p-4 space-y-3 hidden md:block">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Plan du chapitre</p>
          {ch.pov && (
            <div className="bg-background/40 rounded-lg px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase mb-0.5">PDV</p>
              <p className="text-xs">{ch.pov}</p>
            </div>
          )}
          {ch.location && (
            <div className="bg-background/40 rounded-lg px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Lieu</p>
              <p className="text-xs">{ch.location}</p>
            </div>
          )}
          {ch.timeframe && (
            <div className="bg-background/40 rounded-lg px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Moment</p>
              <p className="text-xs">{ch.timeframe}</p>
            </div>
          )}
          {ch.emotionalArc && (
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-2">
              <p className="text-[10px] text-violet-400 uppercase mb-0.5">Arc émotionnel</p>
              <p className="text-xs text-foreground/70 italic">{ch.emotionalArc}</p>
            </div>
          )}
          {ch.keyScene && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              <p className="text-[10px] text-primary uppercase mb-0.5">Scène clé</p>
              <p className="text-xs text-foreground/70">{ch.keyScene}</p>
            </div>
          )}
          {ch.closingHook && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
              <p className="text-[10px] text-yellow-400 uppercase mb-0.5">Accroche finale</p>
              <p className="text-xs text-foreground/70">{ch.closingHook}</p>
            </div>
          )}
          <div className="pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Résumé</p>
            <p className="text-xs text-foreground/60 leading-relaxed">{ch.summary}</p>
          </div>
        </aside>

        {/* Writing area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {generateProse.isPending && (
            <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 border-b border-primary/20 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>L'IA rédige votre chapitre… cela peut prendre 20 à 40 secondes.</span>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Commencez à rédiger le chapitre "${ch.title}"…\n\nOu cliquez sur "Générer avec l'IA" pour obtenir une première version complète basée sur votre plan.`}
            className="flex-1 w-full p-8 bg-transparent text-foreground/90 placeholder:text-muted-foreground/30 font-serif text-base leading-8 resize-none focus:outline-none"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────

function ChapterCard({
  ch,
  index,
  projectId,
  narrativeVoice,
  allChapters,
  onProseUpdated,
}: {
  ch: BookChapter;
  index: number;
  projectId: string;
  narrativeVoice?: string;
  allChapters: BookChapter[];
  onProseUpdated: (index: number, prose: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const hasDetails = ch.pov || ch.location || ch.timeframe || ch.emotionalArc || ch.keyScene || ch.closingHook || ch.voiceNote;
  const hasProse = !!ch.draftContent?.trim();
  const wc = hasProse ? wordCount(ch.draftContent!) : 0;

  return (
    <>
      <AnimatePresence>
        {editing && (
          <ProseEditor
            ch={ch}
            chapterIndex={index}
            projectId={projectId}
            narrativeVoice={narrativeVoice}
            allChapters={allChapters}
            onClose={() => setEditing(false)}
            onSaved={(prose) => {
              onProseUpdated(index, prose);
              setEditing(false);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
        <div className="rounded-xl border border-border/40 bg-background/20 overflow-hidden hover:bg-background/30 transition-colors">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <button
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
              onClick={() => setOpen(!open)}
            >
              <span className="text-xs font-bold text-primary min-w-[2rem] text-center py-1 rounded bg-primary/10">
                {ch.number}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{ch.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {ch.narrativePurpose && !open && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getPurposeStyle(ch.narrativePurpose)}`}>
                      {ch.narrativePurpose.split("(")[0].trim()}
                    </span>
                  )}
                  {hasProse && (
                    <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                      <BookText className="w-2.5 h-2.5" />
                      {wc} mots
                    </span>
                  )}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant={hasProse ? "outline" : "default"}
                className={`text-xs gap-1 h-7 px-2.5 ${hasProse ? "border-primary/30 text-primary hover:bg-primary/10" : "bg-primary/90 hover:bg-primary text-white"}`}
                onClick={() => setEditing(true)}
              >
                <Pen className="w-3 h-3" />
                {hasProse ? "Modifier" : "Rédiger"}
              </Button>
              {hasDetails && (
                <button onClick={() => setOpen(!open)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Expanded plan */}
          {open && (
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/30">
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

              <p className="text-sm text-foreground/80 leading-relaxed">{ch.summary}</p>

              {ch.emotionalArc && (
                <div className="flex items-center gap-2 bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-2">
                  <span className="text-xs text-violet-400 font-medium shrink-0">Arc émotionnel</span>
                  <span className="text-xs text-foreground/70 italic">→ {ch.emotionalArc}</span>
                </div>
              )}

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

              {ch.voiceNote && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-border/40 pl-3">{ch.voiceNote}</p>
              )}

              {/* Prose preview in plan view */}
              {hasProse && (
                <div className="border-t border-border/30 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brouillon</p>
                    <span className="text-[10px] text-green-400 font-medium">{wc} mots</span>
                  </div>
                  <p className="text-sm text-foreground/70 font-serif italic leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {ch.draftContent}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Voir et modifier le chapitre complet →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Book Stats Bar ───────────────────────────────────────────────────────────

function BookStats({ chapters }: { chapters: BookChapter[] }) {
  const written = chapters.filter(c => c.draftContent?.trim()).length;
  const totalWords = chapters.reduce((sum, c) => sum + (c.draftContent ? wordCount(c.draftContent) : 0), 0);
  const pct = chapters.length > 0 ? Math.round((written / chapters.length) * 100) : 0;

  if (written === 0) return null;

  return (
    <div className="bg-background/30 border border-border/40 rounded-xl px-5 py-4 flex items-center gap-6 flex-wrap">
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-primary">{totalWords.toLocaleString("fr-FR")}</span>
        <span className="text-xs text-muted-foreground">mots écrits</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-foreground">{written}<span className="text-muted-foreground text-base font-normal">/{chapters.length}</span></span>
        <span className="text-xs text-muted-foreground">chapitres rédigés</span>
      </div>
      <div className="flex-1 min-w-[160px]">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progression</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: book, isLoading } = useGetBookOutline(id!, {
    query: { enabled: !!id, queryKey: getGetBookOutlineQueryKey(id!) }
  });
  const generate = useGenerateBookOutline();
  const updateBook = useUpdateBookOutline();

  // Local chapters state so prose updates show instantly without refetch
  const [localChapters, setLocalChapters] = useState<BookChapter[] | null>(null);
  const chapters = (localChapters ?? (book?.chapters as unknown as BookChapter[] ?? []));

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        setLocalChapters(null);
        qc.invalidateQueries({ queryKey: getGetBookOutlineQueryKey(id!) });
        toast({ title: "Plan du livre généré" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  const handleProseUpdated = useCallback((index: number, prose: string) => {
    setLocalChapters(prev => {
      const base = prev ?? (book?.chapters as unknown as BookChapter[] ?? []);
      return base.map((c, i) => i === index ? { ...c, draftContent: prose } : c);
    });
  }, [book]);

  const narrativeVoice = (book as unknown as Record<string, string> | undefined)?.narrativeVoice;
  const titleIdeas = book?.titleIdeas ?? [];

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  );

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

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Atelier Livre</h1>
            <p className="text-muted-foreground mt-1">Plan et rédaction de votre manuscrit</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Régénérer le plan
          </Button>
        </div>

        {/* Writing progress bar */}
        <BookStats chapters={chapters} />

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
        {(narrativeVoice || (book as unknown as Record<string, string>).openingLine || (book as unknown as Record<string, string>).closingLine) && (
          <SectionCard title="Signature narrative">
            {narrativeVoice && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Voix narrative</p>
                <p className="text-sm text-foreground/80">{narrativeVoice}</p>
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

        {/* Back cover */}
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
              <ChapterCard
                key={i}
                ch={ch}
                index={i}
                projectId={id!}
                narrativeVoice={narrativeVoice}
                allChapters={chapters}
                onProseUpdated={handleProseUpdated}
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
