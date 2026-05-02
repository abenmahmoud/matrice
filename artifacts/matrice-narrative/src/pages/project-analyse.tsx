import { useState, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useGetProject, useGetMatrix } from "@workspace/api-client-react";
import {
  ScanText, Zap, RotateCcw, TrendingUp, TrendingDown, Sparkles,
  BookOpen, Heart, Users, Star, CheckCircle2, AlertCircle,
  Lightbulb, Library, ArrowRight, ShieldCheck, ShieldAlert,
  ChevronDown, ChevronUp, Target, Brain, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ComparableWork = { title: string; author: string; relevance: string };
type Analysis = {
  id: string; title: string; wordCount: number; projectId?: string;
  globalScore: number; structureScore: number; emotionScore: number;
  archetypeScore: number; originalityScore: number; coherenceScore: number;
  verdict: string;
  strengths: string[]; weaknesses: string[];
  detectedArchetypes: string[]; detectedEmotions: string[];
  appliedTechniques: string[]; missingTechniques: string[];
  coherenceValidations: string[]; coherenceIssues: string[];
  structureAnalysis: string; emotionAnalysis: string;
  recommendations: string; coherenceAnalysis: string;
  comparableWorks: ComparableWork[];
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Score ring
// ---------------------------------------------------------------------------
function ScoreRing({ score, size = 100, stroke = 8, label, sublabel }: {
  score: number; size?: number; stroke?: number; label?: string; sublabel?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#a78bfa" : score >= 60 ? "#818cf8" : score >= 40 ? "#fb923c" : "#f87171";
  const glow = score >= 70 ? "drop-shadow(0 0 8px rgba(167,139,250,0.5))" : "none";
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} className="-rotate-90" style={{ filter: glow }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white leading-none">{score}</span>
          <span className="text-[10px] text-white/30">/100</span>
        </div>
      </div>
      {label && <span className="text-xs text-white/50 font-medium text-center leading-tight">{label}</span>}
      {sublabel && <span className="text-[10px] text-white/25 text-center">{sublabel}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------
function Section({ title, icon: Icon, color = "text-white/50", badge, children, defaultOpen = false }: {
  title: string; icon: React.ElementType; color?: string; badge?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-2.5">
          <Icon className={cn("w-4 h-4", color)} />
          <span className="text-sm font-semibold text-white/80">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
      </button>
      {open && <div className="border-t border-white/[0.06] px-5 py-4">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coherence section
// ---------------------------------------------------------------------------
function CoherenceSection({ analysis }: { analysis: Analysis }) {
  const score = analysis.coherenceScore;
  const label = score >= 80 ? "Haute cohérence" : score >= 60 ? "Cohérence satisfaisante" : score >= 40 ? "Dérives détectées" : "Rupture de vision";
  const labelColor = score >= 80 ? "text-green-300" : score >= 60 ? "text-indigo-300" : score >= 40 ? "text-amber-300" : "text-red-300";
  const borderColor = score >= 80 ? "border-green-500/20 bg-green-500/[0.04]" : score >= 60 ? "border-indigo-500/20 bg-indigo-500/[0.04]" : score >= 40 ? "border-amber-500/20 bg-amber-500/[0.04]" : "border-red-500/20 bg-red-500/[0.04]";

  return (
    <div className={cn("rounded-2xl border p-5", borderColor)}>
      <div className="flex items-center gap-4 mb-4">
        <ScoreRing score={score} size={80} stroke={7} />
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-0.5">Cohérence narrative</p>
          <p className={cn("text-lg font-bold", labelColor)}>{label}</p>
          <p className="text-xs text-white/30 mt-0.5">Fidélité à la vision de la matrice</p>
        </div>
      </div>

      {analysis.coherenceAnalysis && (
        <p className="text-sm text-white/50 leading-relaxed mb-4 border-t border-white/[0.06] pt-4">
          {analysis.coherenceAnalysis}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysis.coherenceValidations.length > 0 && (
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />Validations
            </p>
            <ul className="space-y-1.5">
              {analysis.coherenceValidations.map((v, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/45">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500/60 flex-shrink-0 mt-0.5" />{v}
                </li>
              ))}
            </ul>
          </div>
        )}
        {analysis.coherenceIssues.length > 0 && (
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />Points de friction
            </p>
            <ul className="space-y-1.5">
              {analysis.coherenceIssues.map((iss, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/45">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0 mt-0.5" />{iss}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full results view
// ---------------------------------------------------------------------------
function AnalysisResult({ analysis, onReset, projectTitle }: { analysis: Analysis; onReset: () => void; projectTitle?: string }) {
  const scoreColor = analysis.globalScore >= 80 ? "text-violet-300" : analysis.globalScore >= 60 ? "text-indigo-300" : analysis.globalScore >= 40 ? "text-amber-300" : "text-red-300";
  const date = new Date(analysis.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const hasCoherence = analysis.projectId && analysis.coherenceScore > 0;

  return (
    <div className="space-y-4">
      {/* Top header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.04] p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {projectTitle && (
                <span className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-lg">{projectTitle}</span>
              )}
              <span className="text-xs text-white/25">{date} · {analysis.wordCount.toLocaleString("fr-FR")} mots</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{analysis.title}</h2>
            <p className={cn("text-sm font-medium italic", scoreColor)}>"{analysis.verdict}"</p>
          </div>
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 border border-white/10 rounded-lg px-3 py-1.5 transition-all flex-shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />Nouvel extrait
          </button>
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <ScoreRing score={analysis.globalScore} size={90} label="Global" />
          <ScoreRing score={analysis.structureScore} size={90} label="Structure" />
          <ScoreRing score={analysis.emotionScore} size={90} label="Émotion" />
          <ScoreRing score={analysis.archetypeScore} size={90} label="Archétypes" />
          <ScoreRing score={analysis.originalityScore} size={90} label="Originalité" />
          {hasCoherence
            ? <ScoreRing score={analysis.coherenceScore} size={90} label="Cohérence" sublabel="vs matrice" />
            : <div className="flex items-center justify-center opacity-20"><Layers className="w-8 h-8 text-white/20" /></div>
          }
        </div>
      </div>

      {/* Coherence — only for project analyses */}
      {hasCoherence && <CoherenceSection analysis={analysis} />}

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300">Points forts</span>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500/50 flex-shrink-0 mt-0.5" />{s}
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
                <AlertCircle className="w-3.5 h-3.5 text-amber-500/50 flex-shrink-0 mt-0.5" />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tags grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white/60">Archétypes détectés</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.detectedArchetypes.map((a, i) => (
              <span key={i} className="text-xs bg-purple-500/15 border border-purple-500/25 text-purple-300 px-2 py-0.5 rounded-lg">{a}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-semibold text-white/60">Émotions dominantes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.detectedEmotions.map((e, i) => (
              <span key={i} className="text-xs bg-pink-500/15 border border-pink-500/25 text-pink-300 px-2 py-0.5 rounded-lg">{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white/60">Techniques appliquées</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.appliedTechniques.map((t, i) => (
              <li key={i} className="text-xs text-white/35 flex gap-2"><span className="text-green-500/40">✓</span>{t}</li>
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
              <li key={i} className="text-xs text-white/35 flex gap-2">
                <ArrowRight className="w-3 h-3 text-indigo-400/40 flex-shrink-0 mt-0.5" />{t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed sections */}
      <Section title="Analyse structurelle" icon={BookOpen} color="text-blue-400" defaultOpen>
        <p className="text-sm text-white/45 leading-relaxed whitespace-pre-wrap">{analysis.structureAnalysis}</p>
      </Section>

      <Section title="Analyse émotionnelle" icon={Heart} color="text-pink-400" defaultOpen>
        <p className="text-sm text-white/45 leading-relaxed whitespace-pre-wrap">{analysis.emotionAnalysis}</p>
      </Section>

      <Section title="Recommandations" icon={Lightbulb} color="text-amber-400" defaultOpen>
        <p className="text-sm text-white/45 leading-relaxed whitespace-pre-wrap">{analysis.recommendations}</p>
      </Section>

      <Section title="Œuvres de référence" icon={Library} color="text-violet-400">
        <div className="space-y-3">
          {analysis.comparableWorks.map((w, i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-white/80">{w.title}</span>
                <span className="text-xs text-white/30">— {w.author}</span>
              </div>
              <p className="text-xs text-white/35">{w.relevance}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Context badge strip
// ---------------------------------------------------------------------------
function ContextBadge({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.05]">
      <Icon className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] text-violet-300/60 uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className="text-xs text-white/50 truncate">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ProjectAnalysePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [genState, setGenState] = useState({ isGenerating: false, progress: 0, step: "", error: "" });
  const abortRef = useRef<AbortController | null>(null);

  const { data: project } = useGetProject(id!, { query: { enabled: !!id, queryKey: [`/api/projects/${id!}`] } });
  const { data: matrix } = useGetMatrix(id!, { query: { enabled: !!id, queryKey: [`/api/projects/${id!}/matrix`] } });

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const res = await fetch(`${BASE}/api/manuscripts?projectId=${id}`);
      if (res.ok) { setHistory(await res.json() as Analysis[]); setHistoryLoaded(true); }
    } catch {/* ignore */}
  }, [historyLoaded, id]);

  const deleteAnalysis = async (aid: string) => {
    await fetch(`${BASE}/api/manuscripts/${aid}`, { method: "DELETE" });
    setHistory(h => h.filter(a => a.id !== aid));
    if (analysis?.id === aid) setAnalysis(null);
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
      const res = await fetch(`${BASE}/api/manuscripts/analyze`, {
        method: "POST",
        headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
        body: JSON.stringify({ content, projectId: id }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as { type: string; percent?: number; step?: string; data?: Analysis; message?: string };
            if (ev.type === "progress") setGenState({ isGenerating: true, progress: ev.percent ?? 0, step: ev.step ?? "", error: "" });
            else if (ev.type === "done" && ev.data) {
              setGenState({ isGenerating: false, progress: 100, step: "", error: "" });
              setAnalysis(ev.data);
              setHistory(h => [ev.data as Analysis, ...h]);
              toast({ title: `Score ${(ev.data as Analysis).globalScore}/100 · Cohérence ${(ev.data as Analysis).coherenceScore}/100`, description: (ev.data as Analysis).verdict });
            } else if (ev.type === "error") throw new Error(ev.message);
          } catch {/* skip parse errors */}
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        setGenState(s => ({ ...s, isGenerating: false, error: (err as Error).message }));
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const hasMatrix = !!(matrix?.logline || matrix?.centralConflict);
  const hasEmotional = false; // loaded on server, just display indicator

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <ScanText className="w-6 h-6 text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-serif font-bold text-white">Analyse contextuelle</h1>
              {project && (
                <span className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2.5 py-0.5 rounded-full font-medium">
                  {project.title}
                </span>
              )}
            </div>
            <p className="text-sm text-white/30">
              L'IA analysera votre extrait en le confrontant à votre matrice narrative — archétypes définis, noyau émotionnel, personnages, thèmes.
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={() => void loadHistory()}
              className="text-xs text-white/25 hover:text-white/50 border border-white/[0.08] rounded-lg px-3 py-1.5 transition-all flex-shrink-0">
              {history.length} analyse{history.length > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* Context info strip */}
        {project && (
          <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-violet-400" />
              <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Contexte injecté dans l'analyse</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <ContextBadge label="Projet" value={project.title} icon={Star} />
              <ContextBadge label="Genre · Ton" value={`${project.genre} · ${project.tone}`} icon={Layers} />
              {matrix?.logline && <ContextBadge label="Logline" value={matrix.logline} icon={BookOpen} />}
              {matrix?.centralConflict && <ContextBadge label="Conflit central" value={matrix.centralConflict} icon={Brain} />}
              {matrix?.protagonist && <ContextBadge label="Protagoniste" value={matrix.protagonist} icon={Users} />}
              {matrix?.themes && matrix.themes.length > 0 && (
                <ContextBadge label="Thèmes" value={matrix.themes.slice(0, 3).join(", ")} icon={Heart} />
              )}
            </div>
            {!hasMatrix && (
              <p className="text-xs text-amber-300/60 mt-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Matrice non générée — l'analyse sera standard sans comparaison contextuelle.
              </p>
            )}
          </div>
        )}

        {/* Generation progress */}
        {genState.isGenerating && (
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-white/60">{genState.step}</p>
              <p className="text-xs text-violet-300 font-mono">{genState.progress}%</p>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${genState.progress}%` }} />
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex gap-0.5">{[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}</div>
              <p className="text-xs text-white/25">L'IA confronte votre texte avec votre matrice...</p>
            </div>
          </div>
        )}

        {genState.error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{genState.error}</p>
          </div>
        )}

        {/* Input form */}
        {!analysis && !genState.isGenerating && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/30 uppercase tracking-wider">Extrait à analyser</label>
                <span className="text-xs text-white/20">{wordCount.toLocaleString("fr-FR")} mots</span>
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder={`Collez ici un extrait de votre projet "${project?.title ?? "..."}" — chapitre, scène, dialogue, synopsis...

L'IA va :
· Analyser la structure, les émotions, les archétypes
· Vérifier la cohérence avec votre matrice narrative
· Identifier les dérives par rapport à vos intentions
· Recommander des techniques pour renforcer votre vision`}
                rows={14}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 text-sm px-4 py-3.5 placeholder:text-white/15 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none leading-relaxed transition-all" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {["Premier acte", "Scène clé", "Dialogue pivot", "Climax"].map(t => (
                  <span key={t} className="text-xs text-white/20 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1">{t}</span>
                ))}
              </div>
              <button onClick={() => void handleAnalyze()} disabled={content.trim().length < 50}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 text-white text-sm font-semibold transition-all shadow-[0_4px_24px_rgba(139,92,246,0.35)]">
                <Zap className="w-4 h-4" />Analyser cet extrait
              </button>
            </div>

            {/* History list */}
            {history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-white/25 uppercase tracking-wider mb-3">Analyses précédentes</p>
                <div className="space-y-1.5">
                  {history.slice(0, 5).map(a => (
                    <button key={a.id} onClick={() => setAnalysis(a)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] transition-all text-left group">
                      <div className="flex gap-1.5 flex-shrink-0">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg border",
                          a.globalScore >= 75 ? "text-violet-300 bg-violet-500/15 border-violet-500/25"
                            : a.globalScore >= 50 ? "text-indigo-300 bg-indigo-500/15 border-indigo-500/25"
                              : "text-amber-300 bg-amber-500/15 border-amber-500/25")}>
                          {a.globalScore}
                        </span>
                        {a.coherenceScore > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg border text-green-300 bg-green-500/10 border-green-500/20">
                            ≈{a.coherenceScore}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white/65 truncate">{a.title}</p>
                        <p className="text-xs text-white/20">{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {analysis && !genState.isGenerating && (
          <AnalysisResult analysis={analysis} onReset={() => { setAnalysis(null); setContent(""); }} projectTitle={project?.title} />
        )}
      </div>
    </AppLayout>
  );
}
