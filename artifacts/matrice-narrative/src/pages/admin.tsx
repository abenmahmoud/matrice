import { useState, useRef, useCallback, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FlaskConical, Zap, BookOpen, Globe2, Clock, Sparkles,
  LogOut, Lock, Eye, EyeOff, Trash2, Shield, RefreshCw,
  ChevronDown, ChevronUp, CheckCircle2, Circle, TrendingUp, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Era = { key: string; label: string; start: number; end: number };
type Culture = { key: string; label: string; icon: string };
type Medium = { key: string; label: string };

type ResearchEntry = {
  id: string; title: string; era: string; eraLabel: string;
  culture: string; cultureLabel: string; medium: string;
  summary: string; keyTechniques: string[]; notableWorks: string[];
  narrativeLessons: string; skillsExtracted: boolean;
  extractedSkillIds: string[]; createdAt: string;
};

type Skill = {
  id: string; name: string; description: string; category: string;
  promptContent: string; isActive: boolean;
};

type Stats = {
  totalEntries: number; culturesExplored: number; erasExplored: number;
  totalSkillsExtracted: number; totalPossible: number;
  coverageMatrix: Record<string, Record<string, boolean>>;
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function AdminLogin() {
  const { login } = useAdmin();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Mot de passe incorrect");
      toast({ title: "Accès refusé", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
            <Shield className="w-10 h-10 text-violet-300" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase mb-2">
            MATRICE
          </h1>
          <p className="text-sm text-violet-300/70 uppercase tracking-[0.2em]">Intelligence Secrète</p>
          <div className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent mx-auto" />
        </div>

        {/* Form */}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Mot de passe admin"
              autoComplete="current-password"
              className={cn(
                "w-full h-12 rounded-xl border bg-white/5 px-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all",
                error ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-violet-500/40 focus:border-violet-500/40"
              )}
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Lock className="w-4 h-4" />Accéder au laboratoire</>
            }
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-8">
          Accès réservé — variable <code className="font-mono text-violet-400/50">ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coverage Matrix
// ---------------------------------------------------------------------------
function CoverageMatrix({ eras, cultures, matrix }: {
  eras: Era[]; cultures: Culture[];
  matrix: Record<string, Record<string, boolean>>;
}) {
  const total = eras.length * cultures.length;
  const covered = eras.reduce((sum, era) =>
    sum + cultures.filter(c => matrix[era.key]?.[c.key]).length, 0);
  const pct = Math.round((covered / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Matrice de couverture mondiale</h3>
          <p className="text-xs text-white/40 mt-0.5">{covered}/{total} combinaisons explorées — {pct}%</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-violet-300">{pct}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-1.5 text-xs text-white/20 font-normal w-28"></th>
              {cultures.map(c => (
                <th key={c.key} className="p-1 text-center">
                  <span className="text-base" title={c.label}>{c.icon}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eras.map((era, i) => (
              <tr key={era.key} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                <td className="p-1.5 text-xs text-white/40 font-normal truncate max-w-[112px] pr-3">{era.label}</td>
                {cultures.map(c => {
                  const done = matrix[era.key]?.[c.key];
                  return (
                    <td key={c.key} className="p-1 text-center">
                      <div
                        title={`${era.label} × ${c.label}${done ? " ✓" : " — à explorer"}`}
                        className={cn(
                          "w-5 h-5 rounded mx-auto transition-all duration-300",
                          done
                            ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)] border border-violet-300/30"
                            : "bg-white/[0.04] border border-white/[0.06] hover:bg-white/10"
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-violet-500 border border-violet-300/30 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
          <span className="text-xs text-white/50">Exploré</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/10" />
          <span className="text-xs text-white/50">Non exploré</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill row
// ---------------------------------------------------------------------------
const CAT_COLORS: Record<string, string> = {
  technique: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  structure: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  theme: "bg-green-500/15 text-green-300 border-green-500/25",
  character: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  world: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  style: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  custom: "bg-orange-500/15 text-orange-300 border-orange-500/25",
};

function SkillRow({ skill, onToggle, onDelete }: {
  skill: Skill;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [exp, setExp] = useState(false);
  return (
    <div className={cn(
      "rounded-xl border transition-all overflow-hidden",
      skill.isActive
        ? "border-violet-500/30 bg-violet-500/[0.06]"
        : "border-white/[0.07] bg-white/[0.02]"
    )}>
      <div className="flex items-center gap-3 p-3">
        {/* Toggle */}
        <button onClick={() => onToggle(skill.id, !skill.isActive)} className="flex-shrink-0">
          {skill.isActive
            ? <CheckCircle2 className="w-5 h-5 text-violet-400" />
            : <Circle className="w-5 h-5 text-white/20" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={cn("text-sm font-medium", skill.isActive ? "text-white" : "text-white/50")}>
              {skill.name}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border", CAT_COLORS[skill.category] ?? "bg-white/10 text-white/40 border-white/10")}>
              {skill.category}
            </span>
          </div>
          <p className={cn("text-xs leading-relaxed line-clamp-1", skill.isActive ? "text-white/50" : "text-white/25")}>
            {skill.description}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExp(e => !e)} className="p-1.5 text-white/20 hover:text-white/60 transition-colors">
            {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(skill.id)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {exp && (
        <div className="border-t border-white/5 bg-black/30 p-3">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2 font-medium">Instruction injectée dans l'IA</p>
          <p className="text-xs text-white/60 leading-relaxed font-mono">{skill.promptContent}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry row
// ---------------------------------------------------------------------------
function EntryRow({ entry, onDelete }: { entry: ResearchEntry; onDelete: (id: string) => void }) {
  const [exp, setExp] = useState(false);
  const date = new Date(entry.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FlaskConical className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">{entry.eraLabel}</span>
            <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">{entry.cultureLabel}</span>
            {entry.skillsExtracted && (
              <span className="text-xs bg-violet-500/15 border border-violet-500/25 text-violet-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />{entry.extractedSkillIds.length} skills
              </span>
            )}
            <span className="text-xs text-white/20 ml-auto">{date}</span>
          </div>
          <p className="text-sm font-medium text-white/80 leading-snug">{entry.title}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExp(e => !e)} className="p-1.5 text-white/20 hover:text-white/60 transition-colors">
            {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(entry.id)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {exp && (
        <div className="border-t border-white/5 bg-black/30 p-4 space-y-3">
          <p className="text-xs text-white/50 leading-relaxed">{entry.summary?.slice(0, 500)}...</p>
          {entry.keyTechniques?.length > 0 && (
            <div>
              <p className="text-xs text-violet-300/70 font-semibold uppercase tracking-wider mb-1.5">Techniques clés</p>
              <ul className="space-y-1">
                {entry.keyTechniques.slice(0, 3).map((t, i) => (
                  <li key={i} className="text-xs text-white/40 flex gap-2">
                    <span className="text-violet-500/50 flex-shrink-0">{i + 1}.</span>
                    <span className="line-clamp-2">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.narrativeLessons && (
            <div>
              <p className="text-xs text-green-400/60 font-semibold uppercase tracking-wider mb-1.5">Leçons pour l'auteur</p>
              <p className="text-xs text-white/40 leading-relaxed">{entry.narrativeLessons.slice(0, 300)}...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gen progress bar (inline)
// ---------------------------------------------------------------------------
function GenBar({ state }: { state: { isGenerating: boolean; progress: number; step: string; error: string | null } }) {
  if (!state.isGenerating && !state.error) return null;
  return (
    <div className={cn("rounded-xl border p-4 mb-6", state.error ? "border-red-500/30 bg-red-500/10" : "border-violet-500/30 bg-violet-500/10")}>
      {state.error ? (
        <p className="text-sm text-red-300">{state.error}</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60">{state.step}</p>
            <p className="text-xs text-violet-300 font-mono">{state.progress}%</p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${state.progress}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-xs text-white/40">L'IA explore la tradition narrative...</p>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
const TABS = [
  { key: "lab", label: "Laboratoire", icon: FlaskConical },
  { key: "skills", label: "Skills secrets", icon: Zap },
  { key: "entries", label: "Entrées", icon: BookOpen },
];

function AdminDashboard() {
  const { logout, adminHeaders } = useAdmin();
  const { toast } = useToast();
  const [tab, setTab] = useState("lab");
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [taxonomy, setTaxonomy] = useState<{ eras: Era[]; cultures: Culture[]; mediums: Medium[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [selectedEra, setSelectedEra] = useState("");
  const [selectedCulture, setSelectedCulture] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("cinema");
  const [genState, setGenState] = useState({ isGenerating: false, progress: 0, step: "", error: null as string | null });
  const abortRef = useRef<AbortController | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const h = adminHeaders();
      const [eRes, sRes, stRes, tRes] = await Promise.all([
        fetch(`${BASE}/api/research-lab/entries`, { headers: h }),
        fetch(`${BASE}/api/skills`, { headers: h }),
        fetch(`${BASE}/api/research-lab/stats`, { headers: h }),
        fetch(`${BASE}/api/research-lab/taxonomy`, { headers: h }),
      ]);
      if (!eRes.ok || !sRes.ok || !stRes.ok || !tRes.ok) throw new Error(`HTTP ${eRes.status}`);
      const [e, s, st, t] = await Promise.all([eRes.json(), sRes.json(), stRes.json(), tRes.json()]);
      setEntries(e as ResearchEntry[]);
      setSkills(s as Skill[]);
      setStats(st as Stats);
      setTaxonomy(t as { eras: Era[]; cultures: Culture[]; mediums: Medium[] });
    } catch (err) {
      setError(`Erreur de chargement — ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [adminHeaders]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const generateWithBody = async (url: string, body: Record<string, string>) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setGenState({ isGenerating: true, progress: 5, step: "Connexion à l'IA...", error: null });

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Accept: "text/event-stream", ...adminHeaders() },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as {
              type: string; percent?: number; step?: string;
              data?: ResearchEntry; message?: string;
            };
            if (ev.type === "progress") {
              setGenState({ isGenerating: true, progress: ev.percent ?? 0, step: ev.step ?? "", error: null });
            } else if (ev.type === "done" && ev.data) {
              setGenState({ isGenerating: false, progress: 100, step: "Terminé", error: null });
              setEntries(prev => [ev.data as ResearchEntry, ...prev]);
              toast({ title: "✓ Recherche générée", description: (ev.data as ResearchEntry).title });
              void loadAll();
            } else if (ev.type === "error") {
              throw new Error(ev.message ?? "Erreur IA");
            }
          } catch {/* skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setGenState(s => ({ ...s, isGenerating: false, error: (err as Error).message }));
      }
    }
  };

  const handleDaily = () => void generateWithBody(`${BASE}/api/research-lab/daily`, {});
  const handleManual = () => {
    if (!selectedEra || !selectedCulture) {
      toast({ title: "Sélection requise", variant: "destructive" }); return;
    }
    void generateWithBody(`${BASE}/api/research-lab/generate`, { era: selectedEra, culture: selectedCulture, medium: selectedMedium });
  };

  const deleteEntry = async (id: string) => {
    await fetch(`${BASE}/api/research-lab/entries/${id}`, { method: "DELETE", headers: adminHeaders() });
    setEntries(e => e.filter(x => x.id !== id));
    const stRes = await fetch(`${BASE}/api/research-lab/stats`, { headers: adminHeaders() });
    setStats(await stRes.json() as Stats);
  };

  const toggleSkill = async (id: string, active: boolean) => {
    const res = await fetch(`${BASE}/api/skills/${id}`, {
      method: "PUT", headers: adminHeaders(), body: JSON.stringify({ isActive: active }),
    });
    const updated = await res.json() as Skill;
    setSkills(s => s.map(x => x.id === id ? updated : x));
  };

  const deleteSkill = async (id: string) => {
    await fetch(`${BASE}/api/skills/${id}`, { method: "DELETE", headers: adminHeaders() });
    setSkills(s => s.filter(x => x.id !== id));
  };

  const filteredSkills = filterCat === "all" ? skills : skills.filter(s => s.category === filterCat);
  const allCats = Array.from(new Set(skills.map(s => s.category)));
  const activeSkills = skills.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-serif font-bold tracking-[0.15em] text-sm text-white">MATRICE ADMIN</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/25">
              Intelligence Secrète
            </span>
          </div>
          <div className="flex items-center gap-4">
            {stats && (
              <div className="hidden md:flex items-center gap-5 text-xs">
                <span className="text-white/40"><strong className="text-white">{stats.totalEntries}</strong> entrées</span>
                <span className="text-white/40"><strong className="text-violet-300">{activeSkills}</strong> skills actifs</span>
                <span className="text-white/40"><strong className="text-white">{stats.totalSkillsExtracted}</strong> extraits</span>
              </div>
            )}
            <button onClick={() => void loadAll()} className="p-2 text-white/30 hover:text-white/70 transition-colors" title="Rafraîchir">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors">
              <LogOut className="w-3.5 h-3.5" />Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.06] w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                tab === t.key
                  ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/40 hover:text-white/70"
              )}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
            <p className="text-sm text-white/30">Chargement du laboratoire...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-300 mb-4">{error}</p>
            <Button onClick={() => void loadAll()} variant="outline" size="sm">Réessayer</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ---- TAB: LABORATOIRE ---- */}
            {tab === "lab" && (
              <div className="space-y-6">
                {/* Coverage matrix */}
                {taxonomy && stats && (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                    <CoverageMatrix eras={taxonomy.eras} cultures={taxonomy.cultures} matrix={stats.coverageMatrix} />
                  </div>
                )}

                {/* Stats */}
                {stats && taxonomy && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { icon: BookOpen, v: stats.totalEntries, label: "Entrées générées", color: "text-white/60" },
                      { icon: Globe2, v: `${stats.culturesExplored}/${taxonomy.cultures.length}`, label: "Cultures", color: "text-cyan-300/70" },
                      { icon: Clock, v: `${stats.erasExplored}/${taxonomy.eras.length}`, label: "Époques", color: "text-amber-300/70" },
                      { icon: Zap, v: stats.totalSkillsExtracted, label: "Skills extraits", color: "text-violet-300/70" },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                          <span className="text-xs text-white/30 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{s.v}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cron info */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-violet-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white/80">Cron quotidien actif</p>
                    <p className="text-xs text-white/30 mt-0.5">Une recherche est automatiquement générée chaque jour au démarrage du serveur si aucune n'a été faite ce jour. Le serveur comble en priorité les zones blanches de la matrice.</p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" />
                  </div>
                </div>

                {/* Generation controls */}
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-violet-400" />
                    Générer une recherche maintenant
                  </h3>

                  <GenBar state={genState} />

                  <div className="flex flex-wrap gap-3 mb-5">
                    <button
                      onClick={handleDaily}
                      disabled={genState.isGenerating}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-sm font-medium text-white transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Recherche du jour (auto)
                    </button>
                  </div>

                  {taxonomy && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Ou cibler manuellement</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Époque", value: selectedEra, set: setSelectedEra, opts: taxonomy.eras.map(e => ({ v: e.key, l: e.label })) },
                          { label: "Culture", value: selectedCulture, set: setSelectedCulture, opts: taxonomy.cultures.map(c => ({ v: c.key, l: `${c.icon} ${c.label}` })) },
                          { label: "Médium", value: selectedMedium, set: setSelectedMedium, opts: taxonomy.mediums.map(m => ({ v: m.key, l: m.label })) },
                        ].map(f => (
                          <div key={f.label}>
                            <label className="text-xs text-white/30 mb-1 block">{f.label}</label>
                            <select
                              value={f.value}
                              onChange={e => f.set(e.target.value)}
                              className="w-full h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm px-2 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                            >
                              {f.label !== "Médium" && <option value="">Choisir...</option>}
                              {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                      {selectedEra && selectedCulture && (
                        <button
                          onClick={handleManual}
                          disabled={genState.isGenerating}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-white/70 disabled:opacity-40 transition-all"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Générer cette combinaison
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---- TAB: SKILLS ---- */}
            {tab === "skills" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Skills secrets</h2>
                    <p className="text-sm text-white/30 mt-0.5">
                      <strong className="text-violet-300">{activeSkills}</strong> actifs sur <strong className="text-white/60">{skills.length}</strong> — injectés automatiquement dans toutes les générations IA
                    </p>
                  </div>
                  <button onClick={() => {
                    const allActive = skills.every(s => s.isActive);
                    void Promise.all(skills.map(s => toggleSkill(s.id, !allActive)));
                  }} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {skills.every(s => s.isActive) ? "Tout désactiver" : "Tout activer"}
                  </button>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {["all", ...allCats].map(cat => (
                    <button key={cat} onClick={() => setFilterCat(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        filterCat === cat
                          ? "bg-violet-600/80 text-white border-violet-500/40"
                          : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/60"
                      )}>
                      {cat === "all" ? `Tous (${skills.length})` : `${cat} (${skills.filter(s => s.category === cat).length})`}
                    </button>
                  ))}
                </div>

                {filteredSkills.length === 0 ? (
                  <div className="text-center py-16 border border-white/[0.06] rounded-2xl">
                    <Zap className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">Aucun skill — lancez des recherches dans le Laboratoire</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSkills.map(skill => (
                      <SkillRow key={skill.id} skill={skill}
                        onToggle={(id, a) => void toggleSkill(id, a)}
                        onDelete={id => void deleteSkill(id)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---- TAB: ENTRÉES ---- */}
            {tab === "entries" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Bibliothèque de recherche</h2>
                    <p className="text-sm text-white/30 mt-0.5">{entries.length} entrées dans la base de connaissance narrative</p>
                  </div>
                </div>

                {entries.length === 0 ? (
                  <div className="text-center py-16 border border-white/[0.06] rounded-2xl">
                    <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30 mb-2">Aucune entrée — le laboratoire est vide</p>
                    <button onClick={() => setTab("lab")} className="text-xs text-violet-400/70 hover:text-violet-300 transition-colors">
                      → Aller au Laboratoire pour générer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {entries.map(e => <EntryRow key={e.id} entry={e} onDelete={id => void deleteEntry(id)} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export — gate
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const { isLoggedIn } = useAdmin();
  return isLoggedIn ? <AdminDashboard /> : <AdminLogin />;
}
