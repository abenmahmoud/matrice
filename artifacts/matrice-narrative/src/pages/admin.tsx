import { useState, useRef, useCallback, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GenerationProgress } from "@/components/GenerationProgress";
import {
  FlaskConical, Zap, BookOpen, Globe2, Clock, Sparkles,
  LogOut, Lock, Eye, EyeOff, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, Shield, TrendingUp, RefreshCw
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
  summary: string; keyTechniques: string[]; emotionalPrinciples: string[];
  notableWorks: string[]; narrativeLessons: string;
  skillsExtracted: boolean; extractedSkillIds: string[]; createdAt: string;
};

type Skill = {
  id: string; name: string; description: string; category: string;
  promptContent: string; isActive: boolean; isGlobal: boolean; createdAt: string;
};

type Stats = {
  totalEntries: number; culturesExplored: number; erasExplored: number;
  totalSkillsExtracted: number; totalPossible: number;
  coverageMatrix: Record<string, Record<string, boolean>>;
};

// ---------------------------------------------------------------------------
// Login screen
// ---------------------------------------------------------------------------
function AdminLogin() {
  const { login } = useAdmin();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (!result.ok) {
      toast({ title: "Accès refusé", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-wide">MATRICE ADMIN</h1>
          <p className="text-sm text-muted-foreground mt-1">Intelligence Secrète — Accès restreint</p>
        </div>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe admin"
              className="w-full h-11 rounded-lg border border-input bg-card px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500" disabled={loading || !password}>
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock className="w-4 h-4 mr-2" />Accéder au laboratoire</>}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Définissez <code className="font-mono">ADMIN_PASSWORD</code> dans les variables d'environnement
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coverage Matrix
// ---------------------------------------------------------------------------
function CoverageMatrix({ eras, cultures, matrix }: { eras: Era[]; cultures: Culture[]; matrix: Record<string, Record<string, boolean>> }) {
  const total = eras.length * cultures.length;
  const covered = Object.values(matrix).reduce((sum, row) => sum + Object.values(row).filter(Boolean).length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matrice de couverture mondiale</h3>
        <span className="text-xs text-muted-foreground">{covered}/{total} cellules explorées</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-24 text-left p-1 text-muted-foreground/50 font-normal">Époque ↓ / Culture →</th>
              {cultures.map(c => (
                <th key={c.key} className="p-1 text-center font-normal">
                  <span title={c.label}>{c.icon}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eras.map(era => (
              <tr key={era.key}>
                <td className="p-1 text-muted-foreground/60 text-xs whitespace-nowrap truncate max-w-[96px]">{era.label}</td>
                {cultures.map(c => {
                  const done = matrix[era.key]?.[c.key];
                  return (
                    <td key={c.key} className="p-1 text-center">
                      <div title={done ? `${era.label} × ${c.label} — exploré` : `${era.label} × ${c.label} — non exploré`}
                        className={cn("w-5 h-5 rounded mx-auto transition-all", done ? "bg-violet-500/70 border border-violet-400/50 shadow-[0_0_6px_rgba(139,92,246,0.4)]" : "bg-white/5 border border-white/10")}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-500/70 border border-violet-400/50" />
          <span className="text-xs text-muted-foreground">Exploré</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
          <span className="text-xs text-muted-foreground">Non exploré</span>
        </div>
        <div className="ml-auto">
          <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${(covered / total) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry card (compact)
// ---------------------------------------------------------------------------
function EntryRow({ entry, onDelete }: { entry: ResearchEntry; onDelete: (id: string) => void }) {
  const [exp, setExp] = useState(false);
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden bg-card/50">
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400/80">{entry.eraLabel}</Badge>
            <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{entry.cultureLabel}</Badge>
            {entry.skillsExtracted && <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30"><Zap className="w-2.5 h-2.5 mr-1" />{entry.extractedSkillIds.length}</Badge>}
          </div>
          <p className="text-xs font-medium leading-snug truncate">{entry.title}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExp(e => !e)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            {exp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(entry.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {exp && (
        <div className="border-t border-border/20 p-3 bg-black/20 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">{entry.summary.slice(0, 400)}...</p>
          {entry.narrativeLessons && (
            <div>
              <p className="text-xs font-medium text-green-400/70 mb-1">Leçons pour l'auteur :</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{entry.narrativeLessons.slice(0, 300)}...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skills row
// ---------------------------------------------------------------------------
function SkillRow({ skill, onToggle, onDelete }: { skill: Skill; onToggle: (id: string, active: boolean) => void; onDelete: (id: string) => void }) {
  const CATEGORY_COLORS: Record<string, string> = {
    technique: "border-blue-500/30 text-blue-400",
    structure: "border-amber-500/30 text-amber-400",
    theme: "border-green-500/30 text-green-400",
    character: "border-pink-500/30 text-pink-400",
    world: "border-cyan-500/30 text-cyan-400",
    style: "border-purple-500/30 text-purple-400",
    custom: "border-orange-500/30 text-orange-400",
  };
  const [exp, setExp] = useState(false);

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-card/50 transition-all", skill.isActive ? "border-violet-500/30" : "border-border/30")}>
      <div className="flex items-start gap-3 p-3">
        <button onClick={() => onToggle(skill.id, !skill.isActive)} className="flex-shrink-0 mt-0.5">
          {skill.isActive
            ? <ToggleRight className="w-5 h-5 text-violet-400" />
            : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs font-medium">{skill.name}</span>
            <Badge variant="outline" className={cn("text-xs border", CATEGORY_COLORS[skill.category] ?? "border-border text-muted-foreground")}>{skill.category}</Badge>
            {!skill.isActive && <span className="text-xs text-muted-foreground/50">inactif</span>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{skill.description}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExp(e => !e)} className="p-1.5 text-muted-foreground hover:text-foreground">
            {exp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button onClick={() => onDelete(skill.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {exp && (
        <div className="border-t border-border/20 p-3 bg-black/20">
          <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wider font-medium">Instruction IA</p>
          <p className="text-xs text-muted-foreground leading-relaxed font-mono">{skill.promptContent}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Dashboard
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
  const [loaded, setLoaded] = useState(false);
  const [filterSkillCat, setFilterSkillCat] = useState("all");

  // Generator state
  const [selectedEra, setSelectedEra] = useState("");
  const [selectedCulture, setSelectedCulture] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("cinema");
  const [genState, setGenState] = useState({ isGenerating: false, progress: 0, step: "", error: null as string | null });
  const abortRef = useRef<AbortController | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const h = adminHeaders();
      const [eRes, sRes, stRes, tRes] = await Promise.all([
        fetch(`${BASE}/api/research-lab/entries`, { headers: h }),
        fetch(`${BASE}/api/skills`, { headers: h }),
        fetch(`${BASE}/api/research-lab/stats`, { headers: h }),
        fetch(`${BASE}/api/research-lab/taxonomy`, { headers: h }),
      ]);
      setEntries(await eRes.json() as ResearchEntry[]);
      setSkills(await sRes.json() as Skill[]);
      setStats(await stRes.json() as Stats);
      setTaxonomy(await tRes.json() as { eras: Era[]; cultures: Culture[]; mediums: Medium[] });
      setLoaded(true);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    }
  }, [adminHeaders]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const generateWithBody = async (url: string, body: Record<string, string>) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setGenState({ isGenerating: true, progress: 5, step: "Initialisation...", error: null });
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Accept: "text/event-stream", ...adminHeaders() },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Erreur HTTP ${res.status}`);
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
            const ev = JSON.parse(line.slice(6)) as { type: string; percent?: number; step?: string; data?: ResearchEntry; message?: string };
            if (ev.type === "progress") setGenState({ isGenerating: true, progress: ev.percent ?? 0, step: ev.step ?? "", error: null });
            else if (ev.type === "done" && ev.data) {
              setGenState({ isGenerating: false, progress: 100, step: "Terminé", error: null });
              setEntries(prev => [ev.data as ResearchEntry, ...prev]);
              const stRes = await fetch(`${BASE}/api/research-lab/stats`, { headers: adminHeaders() });
              setStats(await stRes.json() as Stats);
              const sRes = await fetch(`${BASE}/api/skills`, { headers: adminHeaders() });
              setSkills(await sRes.json() as Skill[]);
              toast({ title: "Recherche générée", description: (ev.data as ResearchEntry).title });
            } else if (ev.type === "error") throw new Error(ev.message ?? "Erreur IA");
          } catch { /* skip bad lines */ }
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
    if (!selectedEra || !selectedCulture) { toast({ title: "Sélection requise", variant: "destructive" }); return; }
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
      method: "PUT", headers: adminHeaders(), body: JSON.stringify({ isActive: active })
    });
    const updated = await res.json() as Skill;
    setSkills(s => s.map(x => x.id === id ? updated : x));
  };

  const deleteSkill = async (id: string) => {
    await fetch(`${BASE}/api/skills/${id}`, { method: "DELETE", headers: adminHeaders() });
    setSkills(s => s.filter(x => x.id !== id));
  };

  const filteredSkills = filterSkillCat === "all" ? skills : skills.filter(s => s.category === filterSkillCat);
  const allCats = Array.from(new Set(skills.map(s => s.category)));
  const activeSkills = skills.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen bg-background">
      <GenerationProgress
        isGenerating={genState.isGenerating}
        progress={genState.progress}
        step={genState.step}
        error={genState.error}
        onCancel={() => { abortRef.current?.abort(); setGenState(s => ({ ...s, isGenerating: false })); }}
      />

      {/* Admin header */}
      <header className="border-b border-border/50 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-serif font-bold tracking-widest text-sm">MATRICE ADMIN</span>
            <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">Intelligence Secrète</Badge>
          </div>
          <div className="flex items-center gap-3">
            {stats && (
              <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                <span><strong className="text-foreground">{stats.totalEntries}</strong> entrées</span>
                <span><strong className="text-violet-400">{activeSkills}</strong> skills actifs</span>
                <span><strong className="text-foreground">{stats.totalSkillsExtracted}</strong> skills secrets</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => void loadAll()} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-card/50 rounded-xl p-1 border border-border/50 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all", tab === t.key ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Laboratoire */}
        {tab === "lab" && (
          <div className="space-y-8">
            {/* Coverage matrix */}
            {stats && taxonomy && (
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <CoverageMatrix eras={taxonomy.eras} cultures={taxonomy.cultures} matrix={stats.coverageMatrix} />
              </div>
            )}

            {/* Stats */}
            {stats && taxonomy && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, label: "Entrées", value: stats.totalEntries, sub: "recherches générées", color: "text-primary/70" },
                  { icon: Globe2, label: "Cultures", value: `${stats.culturesExplored}/${taxonomy.cultures.length}`, sub: "traditions explorées", color: "text-cyan-400/70" },
                  { icon: Clock, label: "Époques", value: `${stats.erasExplored}/${taxonomy.eras.length}`, sub: "périodes couvertes", color: "text-amber-400/70" },
                  { icon: Zap, label: "Skills", value: stats.totalSkillsExtracted, sub: "extraits du laboratoire", color: "text-violet-400/70" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center gap-2 mb-1"><s.icon className={cn("w-4 h-4", s.color)} /><span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span></div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Generation controls */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
              <h3 className="text-sm font-semibold mb-5 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-violet-400" />Lancer une recherche</h3>
              <div className="flex flex-wrap gap-3 mb-5">
                <Button onClick={handleDaily} disabled={genState.isGenerating} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                  <Sparkles className="w-4 h-4" />Recherche du jour (auto)
                </Button>
              </div>
              {taxonomy && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Époque</label>
                    <select value={selectedEra} onChange={e => setSelectedEra(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Choisir...</option>
                      {taxonomy.eras.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Culture</label>
                    <select value={selectedCulture} onChange={e => setSelectedCulture(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Choisir...</option>
                      {taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Médium</label>
                    <select value={selectedMedium} onChange={e => setSelectedMedium(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      {taxonomy.mediums.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {selectedEra && selectedCulture && <Button onClick={handleManual} disabled={genState.isGenerating} variant="outline" className="mt-3 gap-2"><FlaskConical className="w-4 h-4" />Générer manuellement</Button>}
            </div>
          </div>
        )}

        {/* TAB: Skills secrets */}
        {tab === "skills" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Skills secrets</h2>
                <p className="text-sm text-muted-foreground">{activeSkills}/{skills.length} actifs — injectés dans toutes les générations IA</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { void Promise.all(skills.map(s => toggleSkill(s.id, !s.isActive))); }} className="text-xs gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />Tout activer/désactiver
              </Button>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["all", ...allCats].map(cat => (
                <button key={cat} onClick={() => setFilterSkillCat(cat)} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", filterSkillCat === cat ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                  {cat === "all" ? `Tous (${skills.length})` : cat}
                </button>
              ))}
            </div>

            {!loaded ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Aucun skill — lancez des recherches dans le Laboratoire</div>
            ) : (
              <div className="space-y-2">
                {filteredSkills.map(skill => (
                  <SkillRow key={skill.id} skill={skill} onToggle={(id, a) => void toggleSkill(id, a)} onDelete={id => void deleteSkill(id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Entrées */}
        {tab === "entries" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Entrées de recherche</h2>
                <p className="text-sm text-muted-foreground">{entries.length} entrées dans la bibliothèque narrative</p>
              </div>
            </div>
            {!loaded ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Aucune entrée — lancez la recherche du jour dans l'onglet Laboratoire</div>
            ) : (
              <div className="space-y-2">
                {entries.map(e => <EntryRow key={e.id} entry={e} onDelete={id => void deleteEntry(id)} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root — gate
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const { isLoggedIn } = useAdmin();
  return isLoggedIn ? <AdminDashboard /> : <AdminLogin />;
}
