import { useState, useRef, useCallback, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FlaskConical, Zap, BookOpen, Globe2, Clock, Sparkles, LogOut,
  Lock, Eye, EyeOff, Trash2, Shield, RefreshCw, CheckCircle2, Circle,
  ChevronDown, ChevronUp, TrendingUp, Calendar, Map, Check, Circle as CircleIcon,
  ScanText, Film, Database, Plus, Pencil, X, ToggleLeft, ToggleRight,
  Loader2, BarChart3, Users, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminAnalysesTab } from "@/components/AdminAnalysesTab";
import { AiSkillsPanel, CinemaPanel, AiStatsPanel, SeedPanel } from "@/components/AdminAiTab";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Era = { key: string; label: string; start: number; end: number };
type Culture = { key: string; label: string; icon: string };
type Medium = { key: string; label: string };
type ResearchType = { key: string; label: string; icon: string; desc: string };

type ResearchEntry = {
  id: string; title: string; researchType: string; era: string; eraLabel: string;
  culture: string; cultureLabel: string; culture2: string; culture2Label: string;
  customInput: string; summary: string; keyTechniques: string[];
  notableWorks: string[]; narrativeLessons: string; themes: string[];
  universalScore: number; skillsExtracted: boolean;
  extractedSkillIds: string[]; createdAt: string;
};

type Skill = {
  id: string; name: string; description: string; category: string;
  promptContent: string; isActive: boolean;
  validationCount: number; isUniversal: boolean; validationSources: string[];
};
type Stats = {
  totalEntries: number; culturesExplored: number; erasExplored: number;
  totalSkillsExtracted: number; totalPossible: number; byType: Record<string, number>;
  coverageMatrix: Record<string, Record<string, boolean>>;
};
type Taxonomy = { eras: Era[]; cultures: Culture[]; mediums: Medium[]; researchTypes: ResearchType[]; universalThemes: string[]; narrativeEmotions: string[]; universalArchetypes: string[] };
type SubscriptionUser = {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "owner";
  plan: "free" | "pro" | "studio" | "enterprise";
  status: "active" | "suspended";
  generationsUsed: number;
  projectsCreated: number;
  stripeCustomerId?: string | null;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function AdminLogin() {
  const { login } = useAdmin();
  const { toast } = useToast();
  const [password, setPassword] = useState(""); const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Mot de passe incorrect"); toast({ title: "Accès refusé", variant: "destructive" }); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
            <Shield className="w-10 h-10 text-violet-300" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase mb-2">MATRICE</h1>
          <p className="text-sm text-violet-300/70 uppercase tracking-[0.2em]">Intelligence Secrète</p>
          <div className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent mx-auto" />
        </div>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Mot de passe Studio" autoComplete="current-password"
              className={cn("w-full h-12 rounded-xl border bg-white/5 px-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all",
                error ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-violet-500/40")} autoFocus />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading || !password}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)]">
            {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Lock className="w-4 h-4" />Accéder au laboratoire</>}
          </button>
        </form>
        <p className="text-center text-xs text-white/20 mt-8">Variable <code className="font-mono text-violet-400/50">ADMIN_PASSWORD</code></p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coverage Matrix
// ---------------------------------------------------------------------------
function CoverageMatrix({ eras, cultures, matrix }: { eras: Era[]; cultures: Culture[]; matrix: Record<string, Record<string, boolean>> }) {
  const total = eras.length * cultures.length;
  const covered = eras.reduce((s, e) => s + cultures.filter(c => matrix[e.key]?.[c.key]).length, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div><p className="text-sm font-bold text-white">Matrice standard</p><p className="text-xs text-white/30">{covered}/{total} — {Math.round(covered / total * 100)}%</p></div>
        <span className="text-2xl font-bold text-violet-300">{Math.round(covered / total * 100)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full" style={{ width: `${covered / total * 100}%` }} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr>
            <th className="w-24 text-left p-1 text-xs text-white/20 font-normal"></th>
            {cultures.map(c => <th key={c.key} className="p-1 text-center"><span title={c.label}>{c.icon}</span></th>)}
          </tr></thead>
          <tbody>{eras.map((era, i) => (
            <tr key={era.key} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
              <td className="p-1 text-xs text-white/30 truncate max-w-[96px]">{era.label}</td>
              {cultures.map(c => {
                const done = matrix[era.key]?.[c.key];
                return <td key={c.key} className="p-1 text-center">
                  <div title={`${era.label} × ${c.label}${done ? " ✓" : ""}`}
                    className={cn("w-5 h-5 rounded mx-auto transition-all", done ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] border border-violet-300/30" : "bg-white/[0.04] border border-white/[0.06]")} />
                </td>;
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Research type badge colors
// ---------------------------------------------------------------------------
const TYPE_STYLES: Record<string, string> = {
  standard: "bg-white/5 text-white/50 border-white/10",
  synthesis: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  emotional_atlas: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  conflict_grammar: "bg-red-500/15 text-red-300 border-red-500/25",
  archetype_deep: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  evolution_spiral: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  problem_solution: "bg-green-500/15 text-green-300 border-green-500/25",
};
const CAT_COLORS: Record<string, string> = {
  technique: "bg-blue-500/15 text-blue-300 border-blue-500/25", structure: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  theme: "bg-green-500/15 text-green-300 border-green-500/25", character: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  world: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25", style: "bg-purple-500/15 text-purple-300 border-purple-500/25",
};

// ---------------------------------------------------------------------------
// Confidence bar
// ---------------------------------------------------------------------------
const CONFIDENCE_THRESHOLD = 3; // validationCount >= 3 → universal

function ConfidenceBar({ count, isUniversal }: { count: number; isUniversal: boolean }) {
  const max = 5;
  const filled = Math.min(count, max);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={cn(
            "w-2.5 h-2.5 rounded-sm transition-all",
            i < filled
              ? isUniversal
                ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                : "bg-violet-400/70"
              : "bg-white/[0.06]"
          )} />
        ))}
      </div>
      {isUniversal
        ? <span className="text-xs text-amber-400 font-semibold">★ Universel</span>
        : <span className="text-xs text-white/25">{count} validation{count > 1 ? "s" : ""}</span>
      }
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill row
// ---------------------------------------------------------------------------
function SkillRow({ skill, onToggle, onDelete }: { skill: Skill; onToggle: (id: string, a: boolean) => void; onDelete: (id: string) => void }) {
  const [exp, setExp] = useState(false);
  const isUniversal = skill.isUniversal || skill.validationCount >= CONFIDENCE_THRESHOLD;

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all",
      isUniversal && skill.isActive ? "border-amber-500/30 bg-amber-500/[0.04]" :
      skill.isActive ? "border-violet-500/30 bg-violet-500/[0.05]" :
      "border-white/[0.06] bg-white/[0.02]"
    )}>
      <div className="flex items-center gap-3 p-3">
        <button onClick={() => onToggle(skill.id, !skill.isActive)} className="flex-shrink-0">
          {skill.isActive
            ? <CheckCircle2 className={cn("w-5 h-5", isUniversal ? "text-amber-400" : "text-violet-400")} />
            : <Circle className="w-5 h-5 text-white/20" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-sm font-medium", skill.isActive ? "text-white" : "text-white/40")}>{skill.name}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border", CAT_COLORS[skill.category] ?? "bg-white/5 text-white/30 border-white/10")}>{skill.category}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className={cn("text-xs line-clamp-1 flex-1 min-w-0", skill.isActive ? "text-white/40" : "text-white/20")}>{skill.description}</p>
            <ConfidenceBar count={skill.validationCount ?? 1} isUniversal={isUniversal} />
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setExp(e => !e)} className="p-1.5 text-white/20 hover:text-white/60">{exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
          <button onClick={() => onDelete(skill.id)} className="p-1.5 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {exp && (
        <div className="border-t border-white/[0.06] bg-black/30 p-4 space-y-3">
          {isUniversal && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
              <span className="text-amber-400 text-sm">★</span>
              <p className="text-xs text-amber-300/80">
                Validé par <strong>{skill.validationCount}</strong> tradition{skill.validationCount > 1 ? "s" : ""} culturelle{skill.validationCount > 1 ? "s" : ""} — poids maximal dans les prompts IA
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-white/20 uppercase tracking-wider mb-2">Instruction IA</p>
            <p className="text-xs text-white/50 font-mono leading-relaxed">{skill.promptContent}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry row
// ---------------------------------------------------------------------------
function EntryRow({ entry, types, onDelete }: { entry: ResearchEntry; types: ResearchType[]; onDelete: (id: string) => void }) {
  const [exp, setExp] = useState(false);
  const typeObj = types.find(t => t.key === entry.researchType);
  const date = new Date(entry.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const subtitle = entry.researchType === "standard"
    ? [entry.eraLabel, entry.cultureLabel].filter(Boolean).join(" × ")
    : entry.researchType === "synthesis" ? `${entry.cultureLabel} × ${entry.culture2Label} — "${entry.customInput}"`
    : entry.customInput || entry.cultureLabel;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-base">{typeObj?.icon ?? "🔭"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-xs px-2 py-0.5 rounded-full border", TYPE_STYLES[entry.researchType] ?? TYPE_STYLES.standard)}>{typeObj?.label ?? entry.researchType}</span>
            {subtitle && <span className="text-xs text-white/30">{subtitle}</span>}
            {entry.skillsExtracted && <span className="text-xs bg-violet-500/15 border border-violet-500/25 text-violet-300 px-2 py-0.5 rounded-full flex items-center gap-1"><Zap className="w-2.5 h-2.5" />{entry.extractedSkillIds.length}</span>}
            {entry.universalScore > 0 && <span className="text-xs text-white/20 ml-auto">{entry.universalScore}/10 universel · {date}</span>}
          </div>
          <p className="text-sm font-medium text-white/80">{entry.title}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setExp(e => !e)} className="p-1.5 text-white/20 hover:text-white/60">{exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
          <button onClick={() => onDelete(entry.id)} className="p-1.5 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {exp && (
        <div className="border-t border-white/5 bg-black/30 p-4 space-y-3">
          <p className="text-xs text-white/40 leading-relaxed">{entry.summary?.slice(0, 400)}...</p>
          {entry.keyTechniques?.length > 0 && (
            <div>
              <p className="text-xs text-violet-300/60 uppercase tracking-wider mb-2 font-semibold">Techniques clés</p>
              <ul className="space-y-1">{entry.keyTechniques.slice(0, 3).map((t, i) => (
                <li key={i} className="text-xs text-white/30 flex gap-2"><span className="text-violet-500/40">{i + 1}.</span><span className="line-clamp-2">{t}</span></li>
              ))}</ul>
            </div>
          )}
          {entry.narrativeLessons && <div><p className="text-xs text-green-400/50 uppercase tracking-wider mb-1.5 font-semibold">Leçons</p><p className="text-xs text-white/30 leading-relaxed">{entry.narrativeLessons.slice(0, 250)}...</p></div>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generation form (dynamic by type)
// ---------------------------------------------------------------------------
function GeneratorForm({ taxonomy, onGenerate, disabled }: {
  taxonomy: Taxonomy;
  onGenerate: (body: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const [rType, setRType] = useState("standard");
  const [era, setEra] = useState(""); const [culture, setCulture] = useState(""); const [culture2, setCulture2] = useState("");
  const [medium, setMedium] = useState("cinema"); const [customInput, setCustomInput] = useState("");
  const [archetypeCultures, setArchetypeCultures] = useState<string[]>(["western", "african", "japanese"]);
  const typeObj = taxonomy.researchTypes.find(t => t.key === rType);

  const suggestions: Record<string, string[]> = {
    synthesis: taxonomy.universalThemes,
    emotional_atlas: taxonomy.narrativeEmotions,
    archetype_deep: taxonomy.universalArchetypes,
    evolution_spiral: ["Le flash-back", "Le cliffhanger", "L'anti-héros", "La narration non-linéaire", "Le deus ex machina"],
    problem_solution: ["L'exposition lourde", "Le personnage passif", "Le deuxième acte qui s'effondre", "La fin décevante", "Le manque de tension"],
  };
  const currentSuggestions = suggestions[rType] ?? [];

  const handleSubmit = () => {
    const body: Record<string, unknown> = { researchType: rType };
    if (rType === "standard") { if (!era || !culture) return; Object.assign(body, { era, culture, medium }); }
    else if (rType === "synthesis") { if (!culture || !culture2 || !customInput) return; Object.assign(body, { culture, culture2, customInput }); }
    else if (rType === "emotional_atlas") { if (!customInput) return; Object.assign(body, { customInput }); }
    else if (rType === "conflict_grammar") { if (!culture) return; Object.assign(body, { culture }); }
    else if (rType === "archetype_deep") { if (!customInput) return; Object.assign(body, { customInput, archetypeCultures }); }
    else if (rType === "evolution_spiral") { if (!customInput || !culture) return; Object.assign(body, { customInput, culture }); }
    else if (rType === "problem_solution") { if (!customInput || !culture) return; Object.assign(body, { customInput, culture }); }
    onGenerate(body);
  };

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div>
        <label className="text-xs text-white/30 mb-2 block uppercase tracking-wider">Type de recherche</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {taxonomy.researchTypes.map(t => (
            <button key={t.key} onClick={() => { setRType(t.key); setCustomInput(""); }}
              className={cn("rounded-xl border p-3 text-left transition-all", rType === t.key ? "border-violet-500/40 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/5")}>
              <div className="flex items-center gap-2 mb-1"><span className="text-lg">{t.icon}</span><span className={cn("text-xs font-semibold", rType === t.key ? "text-white" : "text-white/50")}>{t.label}</span></div>
              <p className="text-xs text-white/25 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic inputs */}
      <div className="grid grid-cols-2 gap-3">
        {/* Standard */}
        {rType === "standard" && (<>
          <div><label className="text-xs text-white/30 mb-1 block">Époque</label>
            <select value={era} onChange={e => setEra(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.eras.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select></div>
          <div><label className="text-xs text-white/30 mb-1 block">Culture</label>
            <select value={culture} onChange={e => setCulture(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select></div>
          <div><label className="text-xs text-white/30 mb-1 block">Médium</label>
            <select value={medium} onChange={e => setMedium(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              {taxonomy.mediums.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select></div>
        </>)}

        {/* Synthesis */}
        {rType === "synthesis" && (<>
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Thème universel</label>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="ex: La mort du héros" className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/80 text-sm px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" /></div>
          <div><label className="text-xs text-white/30 mb-1 block">Culture 1</label>
            <select value={culture} onChange={e => setCulture(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select></div>
          <div><label className="text-xs text-white/30 mb-1 block">Culture 2</label>
            <select value={culture2} onChange={e => setCulture2(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.cultures.filter(c => c.key !== culture).map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select></div>
        </>)}

        {/* Emotional atlas */}
        {rType === "emotional_atlas" && (
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Émotion cible</label>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="ex: Catharsis (libération par la tragédie)" className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/80 text-sm px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" /></div>
        )}

        {/* Conflict grammar */}
        {rType === "conflict_grammar" && (
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Culture</label>
            <select value={culture} onChange={e => setCulture(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select></div>
        )}

        {/* Archetype deep */}
        {rType === "archetype_deep" && (<>
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Archétype</label>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="ex: Le Trickster" className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/80 text-sm px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" /></div>
        </>)}

        {/* Evolution spiral */}
        {rType === "evolution_spiral" && (<>
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Technique narrative</label>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="ex: Le flash-back" className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/80 text-sm px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" /></div>
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Culture</label>
            <select value={culture} onChange={e => setCulture(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select></div>
        </>)}

        {/* Problem → Solution */}
        {rType === "problem_solution" && (<>
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Problème narratif</label>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="ex: L'exposition lourde" className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/80 text-sm px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" /></div>
          <div className="col-span-2"><label className="text-xs text-white/30 mb-1 block">Culture de référence</label>
            <select value={culture} onChange={e => setCulture(e.target.value)} className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
              <option value="">Choisir...</option>{taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
            </select></div>
        </>)}
      </div>

      {/* Suggestions */}
      {currentSuggestions.length > 0 && !customInput && (
        <div>
          <p className="text-xs text-white/20 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-1.5">
            {currentSuggestions.slice(0, 6).map(s => (
              <button key={s} onClick={() => setCustomInput(s)}
                className="text-xs bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.07] px-2.5 py-1 rounded-lg transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={disabled}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm text-white/70 disabled:opacity-40 transition-all">
        <FlaskConical className="w-4 h-4" />Générer — {typeObj?.label}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roadmap
// ---------------------------------------------------------------------------
const ROADMAP = [
  {
    phase: "Phase 1", label: "Fondations", status: "done", color: "text-green-400",
    items: ["Application Matrice Narrative", "Système de projets complet", "11 modules de génération IA", "Exports PDF / DOCX / TXT"],
  },
  {
    phase: "Phase 2", label: "Intelligence temps réel", status: "done", color: "text-green-400",
    items: ["Génération SSE (streaming)", "Barre de progression animée", "Annulation de génération"],
  },
  {
    phase: "Phase 3", label: "Skills IA", status: "done", color: "text-green-400",
    items: ["Skills narratifs personnalisés", "7 catégories de rules", "Injection automatique dans les prompts IA", "Activation / désactivation par skill"],
  },
  {
    phase: "Phase 4", label: "Laboratoire de Recherche", status: "done", color: "text-green-400",
    items: ["Base de connaissance mondiale (10 ères × 8 cultures)", "Extraction automatique de skills secrets", "Cron quotidien autonome", "Matrice de couverture visuelle"],
  },
  {
    phase: "Phase 5", label: "Admin & Sécurité", status: "done", color: "text-green-400",
    items: ["Dashboard admin protégé", "Zone publique / espace protege séparées", "Token HMAC-SHA256", "Gestion skills depuis l'admin"],
  },
  {
    phase: "Phase 6", label: "Intelligence Avancée", status: "active", color: "text-violet-300",
    items: ["⚡ Synthèse croisée (2 cultures × 1 thème universel)", "💡 Atlas émotionnel (structures → émotions cibles)", "⚖️ Grammaire des conflits", "🎭 Archétypes en profondeur", "🌀 Spirale d'évolution", "🎯 Problème → Solution"],
  },
  {
    phase: "Phase 7", label: "Apprentissage adaptatif", status: "planned", color: "text-white/30",
    items: ["Score de confiance universel des skills", "Skills qui évoluent selon les feedbacks projets", "Profil narratif personnalisé par auteur", "Recommandations contextuelles intelligentes"],
  },
  {
    phase: "Phase 8", label: "Analyse & Scoring", status: "planned", color: "text-white/30",
    items: ["Analyse automatique des manuscrits uploadés", "Score narratif détaillé (structure, émotion, cohérence)", "Comparaison avec les grands récits de la base", "Rapport PDF avec recommandations précises"],
  },
  {
    phase: "Phase 9", label: "Collaboration & Partage", status: "planned", color: "text-white/30",
    items: ["Partage de projets entre auteurs", "Mode lecture seule pour co-auteurs", "Export de la matrice narrative complète", "Bibliothèque partagée de skills publics"],
  },
];

function Roadmap() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Roadmap Matrice Narrative</h2>
        <p className="text-sm text-white/30 mt-1">Vision produit — de la fondation à l'intelligence narrative mondiale</p>
      </div>
      <div className="space-y-4">
        {ROADMAP.map(phase => (
          <div key={phase.phase}
            className={cn("rounded-2xl border p-5 transition-all",
              phase.status === "done" ? "border-green-500/20 bg-green-500/[0.03]" :
              phase.status === "active" ? "border-violet-500/30 bg-violet-500/[0.06] shadow-[0_0_20px_rgba(139,92,246,0.08)]" :
              "border-white/[0.05] bg-white/[0.01]")}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0",
                phase.status === "done" ? "border-green-500/40 bg-green-500/15" :
                phase.status === "active" ? "border-violet-500/40 bg-violet-500/20" :
                "border-white/10 bg-white/5")}>
                {phase.status === "done" ? <Check className="w-3.5 h-3.5 text-green-400" /> :
                 phase.status === "active" ? <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" /> :
                 <CircleIcon className="w-3 h-3 text-white/20" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/20 font-mono">{phase.phase}</span>
                  {phase.status === "active" && <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">En cours</span>}
                </div>
                <h3 className={cn("text-sm font-bold", phase.color)}>{phase.label}</h3>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {phase.items.map((item, i) => (
                <li key={i} className={cn("text-xs flex items-start gap-2", phase.status === "done" ? "text-white/40" : phase.status === "active" ? "text-white/60" : "text-white/20")}>
                  <span className={cn("mt-0.5 flex-shrink-0", phase.status === "done" ? "text-green-500/50" : "text-white/15")}>
                    {phase.status === "done" ? "✓" : "·"}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gen bar
// ---------------------------------------------------------------------------
function GenBar({ state }: { state: { isGenerating: boolean; progress: number; step: string; error: string | null } }) {
  if (!state.isGenerating && !state.error) return null;
  return (
    <div className={cn("rounded-xl border p-4 mb-5", state.error ? "border-red-500/30 bg-red-500/10" : "border-violet-500/30 bg-violet-500/10")}>
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : (
        <>
          <div className="flex justify-between mb-2"><p className="text-xs text-white/50">{state.step}</p><p className="text-xs text-violet-300 font-mono">{state.progress}%</p></div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all" style={{ width: `${state.progress}%` }} /></div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-0.5">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
            <p className="text-xs text-white/30">L'IA explore...</p>
          </div>
        </>
      )}
    </div>
  );
}

function AdminSubscriptionsPanel({ adminHeaders }: { adminHeaders: () => HeadersInit }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<SubscriptionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${BASE}/api/admin/subscriptions/users`, { headers: adminHeaders() });
    if (res.ok) setUsers(await res.json() as SubscriptionUser[]);
    setLoading(false);
  }, [adminHeaders]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const updateUser = async (id: string, body: Record<string, unknown>) => {
    setSavingId(id);
    const res = await fetch(`${BASE}/api/admin/subscriptions/users/${id}`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify(body),
    });
    setSavingId(null);
    if (!res.ok) {
      toast({ title: "Mise a jour refusee", variant: "destructive" });
      return;
    }
    const updated = await res.json() as SubscriptionUser;
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updated } : user));
    toast({ title: "Compte mis a jour", description: updated.email });
  };

  if (loading) return <div className="flex items-center gap-3 text-sm text-white/40"><Loader2 className="w-4 h-4 animate-spin" />Chargement abonnements...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-violet-300" />Abonnements</h2>
          <p className="text-sm text-white/30 mt-0.5">{users.length} compte{users.length > 1 ? "s" : ""} inscrit{users.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => void loadUsers()} size="sm" variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Rafraichir</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Free", value: users.filter(u => u.plan === "free").length },
          { label: "Pro", value: users.filter(u => u.plan === "pro").length },
          { label: "Studio", value: users.filter(u => u.plan === "studio").length },
          { label: "Enterprise", value: users.filter(u => u.plan === "enterprise").length },
          { label: "Suspendus", value: users.filter(u => u.status === "suspended").length },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-white/25 uppercase tracking-wider">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.06] rounded-2xl">
          <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">Aucun utilisateur inscrit pour le moment.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          {users.map(user => (
            <div key={user.id} className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 p-4 border-b border-white/[0.06] last:border-b-0 bg-white/[0.02]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white truncate">{user.email}</p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", user.plan === "pro" ? "bg-green-500/15 text-green-300 border-green-500/25" : "bg-white/5 text-white/45 border-white/10")}>{user.plan.toUpperCase()}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", user.status === "active" ? "bg-violet-500/15 text-violet-300 border-violet-500/25" : "bg-red-500/15 text-red-300 border-red-500/25")}>{user.status}</span>
                  {user.role === "owner" && <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/25">OWNER</span>}
                </div>
                <p className="text-xs text-white/30 mt-1">
                  {user.projectsCreated} projet{user.projectsCreated > 1 ? "s" : ""} - {user.generationsUsed} generation{user.generationsUsed > 1 ? "s" : ""} - inscrit le {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Button size="sm" variant={user.plan === "pro" ? "secondary" : "outline"} disabled={savingId === user.id} onClick={() => void updateUser(user.id, { plan: user.plan === "pro" ? "free" : "pro" })}>
                  {user.plan === "pro" ? "Repasser Free" : "Passer Pro"}
                </Button>
                <Button size="sm" variant={user.plan === "studio" ? "secondary" : "outline"} disabled={savingId === user.id} onClick={() => void updateUser(user.id, { plan: "studio" })}>
                  Studio
                </Button>
                <Button size="sm" variant={user.plan === "enterprise" ? "secondary" : "outline"} disabled={savingId === user.id} onClick={() => void updateUser(user.id, { plan: "enterprise" })}>
                  Enterprise
                </Button>
                <Button size="sm" variant="outline" disabled={savingId === user.id} onClick={() => void updateUser(user.id, { resetUsage: true })}>Reset quota</Button>
                <Button size="sm" variant="outline" disabled={savingId === user.id} onClick={() => void updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" })}>
                  {user.status === "active" ? "Suspendre" : "Reactiver"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
const TABS = [
  { key: "lab", label: "Laboratoire", icon: FlaskConical },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "entries", label: "Entrées", icon: BookOpen },
  { key: "analyses", label: "Analyses IA", icon: ScanText },
  { key: "ai-skills", label: "Skills IA", icon: Sparkles },
  { key: "cinema", label: "Cinéma", icon: Film },
  { key: "ai-stats", label: "Stats IA", icon: BarChart3 },
  { key: "subscriptions", label: "Abonnements", icon: CreditCard },
  { key: "seed", label: "Seed", icon: Database },
  { key: "roadmap", label: "Roadmap", icon: Map },
];

function AdminDashboard() {
  const { logout, adminHeaders } = useAdmin();
  const { toast } = useToast();
  const [tab, setTab] = useState("lab");
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [genState, setGenState] = useState({ isGenerating: false, progress: 0, step: "", error: null as string | null });
  const abortRef = useRef<AbortController | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const h = adminHeaders();
      const [eRes, sRes, stRes, tRes] = await Promise.all([
        fetch(`${BASE}/api/research-lab/entries`, { headers: h }),
        fetch(`${BASE}/api/skills`, { headers: h }),
        fetch(`${BASE}/api/research-lab/stats`, { headers: h }),
        fetch(`${BASE}/api/research-lab/taxonomy`, { headers: h }),
      ]);
      if ([eRes, sRes, stRes, tRes].some((res) => res.status === 401)) {
        logout();
        toast({
          title: "Session admin expiree",
          description: "Reconnecte-toi avec le mot de passe admin actuel.",
          variant: "destructive",
        });
        throw new Error("Session admin expiree");
      }
      if (!eRes.ok) throw new Error(`Auth failed: ${eRes.status}`);
      if (!sRes.ok) throw new Error(`Skills failed: ${sRes.status}`);
      if (!stRes.ok) throw new Error(`Stats failed: ${stRes.status}`);
      if (!tRes.ok) throw new Error(`Taxonomy failed: ${tRes.status}`);
      setEntries(await eRes.json() as ResearchEntry[]);
      setSkills(await sRes.json() as Skill[]);
      setStats(await stRes.json() as Stats);
      setTaxonomy(await tRes.json() as Taxonomy);
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  }, [adminHeaders, logout, toast]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const generateWithBody = async (url: string, body: Record<string, unknown>) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setGenState({ isGenerating: true, progress: 5, step: "Connexion...", error: null });
    try {
      const res = await fetch(url, { method: "POST", headers: { Accept: "text/event-stream", ...adminHeaders() }, body: JSON.stringify(body), signal: abortRef.current.signal });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as { type: string; percent?: number; step?: string; data?: ResearchEntry; message?: string };
            if (ev.type === "progress") setGenState({ isGenerating: true, progress: ev.percent ?? 0, step: ev.step ?? "", error: null });
            else if (ev.type === "done" && ev.data) {
              setGenState({ isGenerating: false, progress: 100, step: "Terminé", error: null });
              setEntries(prev => [ev.data as ResearchEntry, ...prev]);
              toast({ title: "✓ Recherche générée", description: (ev.data as ResearchEntry).title });
              void loadAll();
            } else if (ev.type === "error") throw new Error(ev.message);
          } catch {/* skip */}
        }
      }
    } catch (err) { if ((err as Error).name !== "AbortError") setGenState(s => ({ ...s, isGenerating: false, error: (err as Error).message })); }
  };

  const deleteEntry = async (id: string) => { await fetch(`${BASE}/api/research-lab/entries/${id}`, { method: "DELETE", headers: adminHeaders() }); setEntries(e => e.filter(x => x.id !== id)); void loadAll(); };
  const toggleSkill = async (id: string, active: boolean) => { const res = await fetch(`${BASE}/api/skills/${id}`, { method: "PUT", headers: adminHeaders(), body: JSON.stringify({ isActive: active }) }); const u = await res.json() as Skill; setSkills(s => s.map(x => x.id === id ? u : x)); };
  const deleteSkill = async (id: string) => { await fetch(`${BASE}/api/skills/${id}`, { method: "DELETE", headers: adminHeaders() }); setSkills(s => s.filter(x => x.id !== id)); };

  const allCats = Array.from(new Set(skills.map(s => s.category)));
  const allTypes = Array.from(new Set(entries.map(e => e.researchType)));
  const filteredSkills = filterCat === "all" ? skills : skills.filter(s => s.category === filterCat);
  const filteredEntries = filterType === "all" ? entries : entries.filter(e => e.researchType === filterType);
  const activeSkills = skills.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-serif font-bold tracking-[0.15em] text-sm">MATRICE ADMIN</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/25">Intelligence Secrète</span>
          </div>
          <div className="flex items-center gap-4">
            {stats && <div className="hidden md:flex gap-5 text-xs">
              <span className="text-white/30"><strong className="text-white">{stats.totalEntries}</strong> entrées</span>
              <span className="text-white/30"><strong className="text-violet-300">{activeSkills}</strong> skills actifs</span>
            </div>}
            <button onClick={() => void loadAll()} className="p-2 text-white/30 hover:text-white/70"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70"><LogOut className="w-3.5 h-3.5" />Sortir</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.06] w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                tab === t.key ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white shadow-lg" : "text-white/40 hover:text-white/70")}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {loading && <div className="flex flex-col items-center py-24 gap-4"><div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" /><p className="text-sm text-white/30">Chargement...</p></div>}
        {!loading && error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center"><p className="text-sm text-red-300 mb-4">{error}</p><Button onClick={() => void loadAll()} size="sm" variant="outline">Réessayer</Button></div>}

        {!loading && !error && (<>
          {/* TAB: LAB */}
          {tab === "lab" && (
            <div className="space-y-6">
              {taxonomy && stats && <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"><CoverageMatrix eras={taxonomy.eras} cultures={taxonomy.cultures} matrix={stats.coverageMatrix} /></div>}

              {/* Stats by type */}
              {stats && taxonomy && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: BookOpen, v: stats.totalEntries, l: "Total entrées" },
                    { icon: Globe2, v: `${stats.culturesExplored}/${taxonomy.cultures.length}`, l: "Cultures" },
                    { icon: Clock, v: `${stats.erasExplored}/${taxonomy.eras.length}`, l: "Époques" },
                    { icon: Zap, v: stats.totalSkillsExtracted, l: "Skills extraits" },
                  ].map((s, i) => <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-1.5 mb-1.5"><s.icon className="w-3.5 h-3.5 text-white/30" /><span className="text-xs text-white/20 uppercase tracking-wider">{s.l}</span></div>
                    <p className="text-2xl font-bold">{s.v}</p>
                  </div>)}
                </div>
              )}

              {/* Research type stats */}
              {stats?.byType && Object.keys(stats.byType).length > 1 && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs text-white/20 uppercase tracking-wider mb-3">Répartition par type</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.byType).map(([type, count]) => {
                      const t = taxonomy?.researchTypes.find(x => x.key === type);
                      return <span key={type} className={cn("text-xs px-2.5 py-1 rounded-full border", TYPE_STYLES[type] ?? TYPE_STYLES.standard)}>{t?.icon} {t?.label ?? type} ({count})</span>;
                    })}
                  </div>
                </div>
              )}

              {/* Cron */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <div><p className="text-sm font-medium text-white/80">Cron quotidien actif</p>
                  <p className="text-xs text-white/25 mt-0.5">Recherche automatique chaque jour — priorise les types avancés après 5 entrées standard.</p></div>
                <div className="ml-auto w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
              </div>

              {/* Generator */}
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" />Générer une recherche</h3>
                <p className="text-xs text-white/30 mb-5">6 types d'intelligence narrative disponibles</p>
                <GenBar state={genState} />
                <div className="flex gap-3 mb-6">
                  <button onClick={() => void generateWithBody(`${BASE}/api/research-lab/daily`, {})} disabled={genState.isGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-sm font-medium text-white transition-all shadow-[0_4px_20px_rgba(139,92,246,0.25)]">
                    <Sparkles className="w-4 h-4" />Recherche du jour (auto)
                  </button>
                </div>
                {taxonomy && <GeneratorForm taxonomy={taxonomy} onGenerate={body => void generateWithBody(`${BASE}/api/research-lab/generate`, body)} disabled={genState.isGenerating} />}
              </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {tab === "skills" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div><h2 className="text-lg font-bold">Skills secrets</h2><p className="text-sm text-white/30 mt-0.5"><strong className="text-violet-300">{activeSkills}</strong>/{skills.length} actifs</p></div>
                <button onClick={() => { const all = skills.every(s => s.isActive); void Promise.all(skills.map(s => toggleSkill(s.id, !all))); }} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 border border-white/10 rounded-lg px-3 py-1.5"><TrendingUp className="w-3.5 h-3.5" />Tout basculer</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {["all", ...allCats].map(cat => <button key={cat} onClick={() => setFilterCat(cat)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", filterCat === cat ? "bg-violet-600/80 text-white border-violet-500/40" : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/60")}>{cat === "all" ? `Tous (${skills.length})` : `${cat} (${skills.filter(s => s.category === cat).length})`}</button>)}
              </div>
              {filteredSkills.length === 0
                ? <div className="text-center py-16 border border-white/[0.06] rounded-2xl"><Zap className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-sm text-white/30">Aucun skill — lancez des recherches dans le Laboratoire</p></div>
                : <div className="space-y-2">{filteredSkills.map(s => <SkillRow key={s.id} skill={s} onToggle={(id, a) => void toggleSkill(id, a)} onDelete={id => void deleteSkill(id)} />)}</div>}
            </div>
          )}

          {/* TAB: ENTRIES */}
          {tab === "entries" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div><h2 className="text-lg font-bold">Bibliothèque de recherche</h2><p className="text-sm text-white/30 mt-0.5">{entries.length} entrées</p></div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {["all", ...allTypes].map(type => {
                  const t = taxonomy?.researchTypes.find(x => x.key === type);
                  return <button key={type} onClick={() => setFilterType(type)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", filterType === type ? "bg-violet-600/80 text-white border-violet-500/40" : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/60")}>
                    {type === "all" ? `Tous (${entries.length})` : `${t?.icon ?? ""} ${t?.label ?? type} (${entries.filter(e => e.researchType === type).length})`}
                  </button>;
                })}
              </div>
              {filteredEntries.length === 0
                ? <div className="text-center py-16 border border-white/[0.06] rounded-2xl"><BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-sm text-white/30">Aucune entrée</p></div>
                : <div className="space-y-2">{filteredEntries.map(e => <EntryRow key={e.id} entry={e} types={taxonomy?.researchTypes ?? []} onDelete={id => void deleteEntry(id)} />)}</div>}
            </div>
          )}

          {/* TAB: ANALYSES IA */}
          {tab === "analyses" && <AdminAnalysesTab />}

          {/* TAB: AI SKILLS */}
          {tab === "ai-skills" && <AiSkillsPanel adminHeaders={adminHeaders} />}

          {/* TAB: CINEMA */}
          {tab === "cinema" && <CinemaPanel adminHeaders={adminHeaders} />}

          {/* TAB: AI STATS */}
          {tab === "ai-stats" && <AiStatsPanel adminHeaders={adminHeaders} />}

          {/* TAB: ABONNEMENTS */}
          {tab === "subscriptions" && <AdminSubscriptionsPanel adminHeaders={adminHeaders} />}

          {/* TAB: SEED */}
          {tab === "seed" && <SeedPanel adminHeaders={adminHeaders} />}

          {/* TAB: ROADMAP */}
          {tab === "roadmap" && <Roadmap />}
        </>)}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isLoggedIn } = useAdmin();
  return isLoggedIn ? <AdminDashboard /> : <AdminLogin />;
}
