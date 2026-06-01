import { useState, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Zap, ChevronDown, ChevronUp, Trash2, RotateCcw,
  TrendingUp, TrendingDown, Sparkles, BookOpen, Heart, Users, Star,
  CheckCircle2, AlertCircle, Lightbulb, Clock, Library, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ComparableWork = { title: string; author: string; relevance: string };
type Analysis = {
  id: string; title: string; wordCount: number;
  globalScore: number; structureScore: number; emotionScore: number;
  archetypeScore: number; originalityScore: number;
  verdict: string;
  strengths: string[]; weaknesses: string[];
  detectedArchetypes: string[]; detectedEmotions: string[];
  appliedTechniques: string[]; missingTechniques: string[];
  structureAnalysis: string; emotionAnalysis: string;
  recommendations: string;
  comparableWorks: ComparableWork[];
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Score ring
// ---------------------------------------------------------------------------
function ScoreRing({ score, size = 120, stroke = 10, label }: { score: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#a78bfa" : score >= 50 ? "#818cf8" : score >= 30 ? "#fb923c" : "#f87171";
  const glow = score >= 75 ? "drop-shadow(0 0 8px rgba(167,139,250,0.6))" : score >= 50 ? "drop-shadow(0 0 6px rgba(129,140,248,0.4))" : "none";

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} className="-rotate-90" style={{ filter: glow }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-white/30">/100</span>
        </div>
      </div>
      {label && <span className="text-xs text-white/40 text-center">{label}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini score bar
// ---------------------------------------------------------------------------
function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const color = score >= 75 ? "from-violet-500 to-indigo-400" : score >= 50 ? "from-indigo-500 to-blue-400" : score >= 30 ? "from-amber-500 to-orange-400" : "from-red-500 to-rose-400";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/60">{label}</span>
        </div>
        <span className="text-xs font-bold text-white">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section expand/collapse
// ---------------------------------------------------------------------------
function Section({ title, icon: Icon, color = "text-white/60", children, defaultOpen = false }: {
  title: string; icon: React.ElementType; color?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-2.5">
          <Icon className={cn("w-4 h-4", color)} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
      </button>
      {open && <div className="border-t border-white/[0.06] p-4">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analysis result
// ---------------------------------------------------------------------------
function AnalysisResult({ analysis, onReset }: { analysis: Analysis; onReset: () => void }) {
  const scoreColor = analysis.globalScore >= 75 ? "text-violet-300" : analysis.globalScore >= 50 ? "text-indigo-300" : analysis.globalScore >= 30 ? "text-amber-300" : "text-red-300";
  const date = new Date(analysis.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.04] p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/30 uppercase tracking-wider">{date} · {analysis.wordCount.toLocaleString("fr-FR")} mots analysés</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{analysis.title}</h2>
            <p className={cn("text-sm font-medium italic", scoreColor)}>"{analysis.verdict}"</p>
          </div>
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 border border-white/10 rounded-lg px-3 py-1.5 transition-all flex-shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />Nouvelle analyse
          </button>
        </div>

        {/* Scores */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <ScoreRing score={analysis.globalScore} size={110} label="Score global" />
          <div className="flex-1 min-w-[200px] space-y-3">
            <ScoreBar label="Structure narrative" score={analysis.structureScore} icon={BookOpen} />
            <ScoreBar label="Résonance émotionnelle" score={analysis.emotionScore} icon={Heart} />
            <ScoreBar label="Richesse des archétypes" score={analysis.archetypeScore} icon={Users} />
            <ScoreBar label="Originalité de la voix" score={analysis.originalityScore} icon={Star} />
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300">Points forts</span>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500/60 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">Points à renforcer</span>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/50">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detected elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white/70">Archétypes détectés</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.detectedArchetypes.map((a, i) => (
              <span key={i} className="text-xs bg-purple-500/15 border border-purple-500/25 text-purple-300 px-2 py-1 rounded-lg">{a}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-semibold text-white/70">Émotions dominantes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.detectedEmotions.map((e, i) => (
              <span key={i} className="text-xs bg-pink-500/15 border border-pink-500/25 text-pink-300 px-2 py-1 rounded-lg">{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white/70">Techniques appliquées</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.appliedTechniques.map((t, i) => (
              <li key={i} className="text-xs text-white/40 flex gap-2"><span className="text-green-500/40">✓</span>{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-300">Techniques manquantes</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.missingTechniques.map((t, i) => (
              <li key={i} className="text-xs text-white/40 flex gap-2"><ArrowRight className="w-3 h-3 text-indigo-400/50 flex-shrink-0 mt-0.5" />{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed sections */}
      <Section title="Analyse structurelle" icon={BookOpen} color="text-blue-400" defaultOpen>
        <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap">{analysis.structureAnalysis}</p>
      </Section>

      <Section title="Analyse émotionnelle" icon={Heart} color="text-pink-400" defaultOpen>
        <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap">{analysis.emotionAnalysis}</p>
      </Section>

      <Section title="Recommandations concrètes" icon={Lightbulb} color="text-amber-400" defaultOpen>
        <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap">{analysis.recommendations}</p>
      </Section>

      <Section title="Œuvres de référence" icon={Library} color="text-violet-400">
        <div className="space-y-3">
          {analysis.comparableWorks.map((w, i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-white/80">{w.title}</span>
                <span className="text-xs text-white/30">— {w.author}</span>
              </div>
              <p className="text-xs text-white/40">{w.relevance}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// History panel
// ---------------------------------------------------------------------------
function HistoryItem({ a, onLoad, onDelete }: { a: Analysis; onLoad: (a: Analysis) => void; onDelete: (id: string) => void }) {
  const scoreColor = a.globalScore >= 75 ? "text-violet-300 bg-violet-500/15 border-violet-500/25"
    : a.globalScore >= 50 ? "text-indigo-300 bg-indigo-500/15 border-indigo-500/25"
    : a.globalScore >= 30 ? "text-amber-300 bg-amber-500/15 border-amber-500/25"
    : "text-red-300 bg-red-500/15 border-red-500/25";
  const date = new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] group transition-all">
      <button onClick={() => onLoad(a)} className="flex-1 flex items-center gap-3 min-w-0 text-left">
        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border flex-shrink-0", scoreColor)}>{a.globalScore}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/70 truncate">{a.title}</p>
          <p className="text-xs text-white/25">{date} · {a.wordCount.toLocaleString("fr-FR")} mots</p>
        </div>
      </button>
      <button onClick={() => onDelete(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AnalysePage() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [genState, setGenState] = useState({ isGenerating: false, progress: 0, step: "", error: "" });
  const abortRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const res = await apiFetch(`${BASE}/api/manuscripts`);
      if (res.ok) { setHistory(await res.json() as Analysis[]); setHistoryLoaded(true); }
    } catch {/* ignore */}
  }, [historyLoaded]);

  const deleteAnalysis = async (id: string) => {
    await apiFetch(`${BASE}/api/manuscripts/${id}`, { method: "DELETE" });
    setHistory(h => h.filter(a => a.id !== id));
    if (analysis?.id === id) setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!content.trim() || content.trim().length < 50) {
      toast({ title: "Texte trop court", description: "Collez au minimum 50 caractères.", variant: "destructive" });
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setGenState({ isGenerating: true, progress: 5, step: "Connexion...", error: "" });
    setAnalysis(null);

    try {
      const res = await apiFetch(`${BASE}/api/manuscripts/analyze`, {
        method: "POST",
        headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
        body: JSON.stringify({ content, projectTitle }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as { type: string; percent?: number; step?: string; data?: Analysis; message?: string };
            if (ev.type === "progress") setGenState({ isGenerating: true, progress: ev.percent ?? 0, step: ev.step ?? "", error: "" });
            else if (ev.type === "done" && ev.data) {
              setGenState({ isGenerating: false, progress: 100, step: "Rapport prêt", error: "" });
              setAnalysis(ev.data);
              setHistory(h => [ev.data as Analysis, ...h]);
              toast({ title: `✓ Score ${(ev.data as Analysis).globalScore}/100`, description: (ev.data as Analysis).verdict });
            } else if (ev.type === "error") throw new Error(ev.message);
          } catch {/* skip */}
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setGenState(s => ({ ...s, isGenerating: false, error: (err as Error).message }));
      }
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        {/* Left — history */}
        <aside className="w-60 flex-shrink-0 border-r border-white/[0.06] bg-black/20 flex flex-col">
          <div className="p-4 border-b border-white/[0.06]">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Analyses récentes</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1" onMouseEnter={() => void loadHistory()}>
            {history.length === 0 && (
              <div className="p-4 text-center">
                <Clock className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20">Vos analyses apparaîtront ici</p>
              </div>
            )}
            {history.map(a => <HistoryItem key={a.id} a={a} onLoad={setAnalysis} onDelete={id => void deleteAnalysis(id)} />)}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-white">Analyse de Manuscrit</h1>
                  <p className="text-xs text-white/30">Diagnostic narratif professionnel par l'IA</p>
                </div>
              </div>
            </div>

            {/* Generation progress */}
            {genState.isGenerating && (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-white/60">{genState.step}</p>
                  <p className="text-xs text-violet-300 font-mono">{genState.progress}%</p>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all" style={{ width: `${genState.progress}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">{[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                  <p className="text-xs text-white/30">L'IA lit et analyse votre texte...</p>
                </div>
              </div>
            )}
            {genState.error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-6">
                <p className="text-sm text-red-300">{genState.error}</p>
              </div>
            )}

            {/* Input form (shown if no active analysis) */}
            {!analysis && !genState.isGenerating && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-wider mb-2 block">Titre du projet (optionnel)</label>
                  <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)}
                    placeholder="ex: Mon roman, Scénario pilote..."
                    className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 text-sm px-4 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-white/30 uppercase tracking-wider">Texte à analyser</label>
                    <span className="text-xs text-white/20">{wordCount.toLocaleString("fr-FR")} mots</span>
                  </div>
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Collez ici votre premier chapitre, un synopsis, une scène, ou n'importe quel extrait narratif...

L'IA va analyser :
· La structure narrative (actes, rythme, tension)
· La profondeur émotionnelle et les archétypes
· Les techniques déjà appliquées et celles qui manquent
· L'originalité de la voix
· Des œuvres comparables comme références"
                    rows={16}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 text-sm px-4 py-3 placeholder:text-white/15 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none leading-relaxed transition-all" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {["Synopsis (500 mots)", "Premier chapitre", "Scène clé", "Pitch document"].map(t => (
                      <span key={t} className="text-xs text-white/20 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1">{t}</span>
                    ))}
                  </div>
                  <button onClick={() => void handleAnalyze()}
                    disabled={content.trim().length < 50}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)]">
                    <Zap className="w-4 h-4" />Analyser le texte
                  </button>
                </div>

                {/* Capabilities */}
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-5 mt-2">
                  <p className="text-xs text-white/20 uppercase tracking-wider mb-4">Ce que l'analyse couvre</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: BookOpen, label: "Structure narrative", desc: "Actes, plot points, rythme, gestion de la tension" },
                      { icon: Heart, label: "Résonance émotionnelle", desc: "Profondeur, mécanismes, ce qui touche et ce qui manque" },
                      { icon: Users, label: "Archétypes & personnages", desc: "Archétypes jungiens détectés, richesse des profils" },
                      { icon: Star, label: "Originalité", desc: "Voix unique, évitement des clichés, singularité" },
                      { icon: Sparkles, label: "Techniques manquantes", desc: "Ce qui élèverait ce texte, depuis la bibliothèque mondiale" },
                      { icon: Library, label: "Œuvres de référence", desc: "3 œuvres comparables avec analyse de la pertinence" },
                    ].map((c, i) => (
                      <div key={i} className="flex gap-2.5">
                        <c.icon className="w-4 h-4 text-violet-400/50 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-white/50 font-medium">{c.label}</p>
                          <p className="text-xs text-white/20">{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysis && !genState.isGenerating && (
              <AnalysisResult analysis={analysis} onReset={() => { setAnalysis(null); setContent(""); }} />
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
