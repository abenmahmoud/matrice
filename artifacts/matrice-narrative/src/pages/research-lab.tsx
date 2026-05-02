import { useState, useCallback, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GenerationProgress } from "@/components/GenerationProgress";
import { useGenerateSSE } from "@/hooks/useGenerateSSE";
import {
  FlaskConical, Zap, BookOpen, Globe2, Film, ScrollText,
  ChevronDown, ChevronUp, Sparkles, Calendar, Clock, Trash2,
  TrendingUp, Users, Map
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Era = { key: string; label: string; start: number; end: number; desc: string };
type Culture = { key: string; label: string; icon: string; desc: string };
type Medium = { key: string; label: string };

type ResearchEntry = {
  id: string;
  title: string;
  era: string;
  eraLabel: string;
  eraStart: number | null;
  eraEnd: number | null;
  culture: string;
  cultureLabel: string;
  medium: string;
  summary: string;
  keyTechniques: string[];
  emotionalPrinciples: string[];
  culturalContext: string;
  notableWorks: string[];
  narrativeLessons: string;
  skillsExtracted: boolean;
  extractedSkillIds: string[];
  createdAt: string;
};

type Stats = {
  totalEntries: number;
  culturesExplored: number;
  erasExplored: number;
  totalSkillsExtracted: number;
  totalPossible: number;
  coverageMatrix: Record<string, Record<string, boolean>>;
};

const CULTURE_COLORS: Record<string, string> = {
  western: "border-blue-500/40 bg-blue-500/5 text-blue-400",
  arabic: "border-amber-500/40 bg-amber-500/5 text-amber-400",
  indian: "border-orange-500/40 bg-orange-500/5 text-orange-400",
  american: "border-red-500/40 bg-red-500/5 text-red-400",
  japanese: "border-pink-500/40 bg-pink-500/5 text-pink-400",
  african: "border-yellow-600/40 bg-yellow-600/5 text-yellow-500",
  latin: "border-green-500/40 bg-green-500/5 text-green-400",
  east_asian: "border-purple-500/40 bg-purple-500/5 text-purple-400",
};

function EntryCard({ entry, cultures, onDelete }: { entry: ResearchEntry; cultures: Culture[]; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const culture = cultures.find(c => c.key === entry.culture);
  const colorClass = CULTURE_COLORS[entry.culture] ?? "border-border bg-card text-muted-foreground";

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden transition-all", colorClass.split(" ")[0])}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-lg">{culture?.icon}</span>
              <Badge variant="outline" className={cn("text-xs border", colorClass)}>{entry.cultureLabel}</Badge>
              <Badge variant="outline" className="text-xs border border-primary/30 text-primary/70 bg-primary/5">{entry.eraLabel}</Badge>
              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{entry.medium}</Badge>
              {entry.skillsExtracted && (
                <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                  <Zap className="w-2.5 h-2.5 mr-1" />{entry.extractedSkillIds.length} skills
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold leading-snug">{entry.title}</h3>
          </div>
          <button onClick={() => onDelete(entry.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">{entry.summary}</p>

        {entry.notableWorks.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.notableWorks.slice(0, 3).map((w, i) => (
              <span key={i} className="text-xs bg-white/5 rounded px-2 py-0.5 text-muted-foreground/70 truncate max-w-[160px]">{w}</span>
            ))}
          </div>
        )}

        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Réduire" : "Voir les techniques & leçons"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/30 p-5 space-y-4 bg-black/20">
          {entry.keyTechniques.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">Techniques narratives clés</h4>
              <ul className="space-y-2">
                {entry.keyTechniques.map((t, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <span className="text-primary/50 flex-shrink-0 font-mono">{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.emotionalPrinciples.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/70 mb-2">Principes émotionnels</h4>
              <ul className="space-y-1.5">
                {entry.emotionalPrinciples.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <span className="text-amber-400/50 flex-shrink-0">◆</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.narrativeLessons && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400/70 mb-2">Leçons pour l'auteur aujourd'hui</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{entry.narrativeLessons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResearchLabPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [taxonomy, setTaxonomy] = useState<{ eras: Era[]; cultures: Culture[]; mediums: Medium[] } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filterCulture, setFilterCulture] = useState<string>("all");
  const [filterEra, setFilterEra] = useState<string>("all");
  const [selectedEra, setSelectedEra] = useState<string>("");
  const [selectedCulture, setSelectedCulture] = useState<string>("");
  const [selectedMedium, setSelectedMedium] = useState<string>("cinema");
  const [showGenerator, setShowGenerator] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<ResearchEntry | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleDone = useCallback((data: unknown) => {
    const entry = data as ResearchEntry & { skills?: unknown[] };
    setEntries(prev => [entry, ...prev]);
    setLastGenerated(entry);
    loadStats();
    toast({
      title: "Recherche générée",
      description: `"${entry.title}" — ${entry.extractedSkillIds?.length ?? 0} skills secrets extraits`,
    });
  }, []);

  const sse = useGenerateSSE(handleDone);

  const loadAll = async () => {
    try {
      const [entriesRes, statsRes, taxRes] = await Promise.all([
        fetch(`${BASE}/api/research-lab/entries`),
        fetch(`${BASE}/api/research-lab/stats`),
        fetch(`${BASE}/api/research-lab/taxonomy`),
      ]);
      setEntries(await entriesRes.json());
      setStats(await statsRes.json());
      setTaxonomy(await taxRes.json());
      setLoaded(true);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger le laboratoire", variant: "destructive" });
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${BASE}/api/research-lab/stats`);
      setStats(await res.json());
    } catch {}
  };

  if (!loaded) { loadAll(); }

  const handleGenerate = () => {
    if (!selectedEra || !selectedCulture) {
      toast({ title: "Sélection requise", description: "Choisissez une ère et une culture", variant: "destructive" });
      return;
    }
    sse.generate(`${BASE}/api/research-lab/generate`, "POST");
    // Need to pass body — rebuild with fetch
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    // Use the SSE with body
    void generateWithBody(`${BASE}/api/research-lab/generate`, { era: selectedEra, culture: selectedCulture, medium: selectedMedium });
  };

  const handleDaily = () => {
    void generateWithBody(`${BASE}/api/research-lab/daily`, {});
  };

  const [genState, setGenState] = useState({ isGenerating: false, progress: 0, step: "", error: null as string | null });

  const generateWithBody = async (url: string, body: Record<string, string>) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setGenState({ isGenerating: true, progress: 5, step: "Connexion à l'IA...", error: null });
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
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
            const ev = JSON.parse(line.slice(6));
            if (ev.type === "progress") setGenState({ isGenerating: true, progress: ev.percent, step: ev.step, error: null });
            else if (ev.type === "done") {
              setGenState({ isGenerating: false, progress: 100, step: "Terminé", error: null });
              handleDone(ev.data);
            } else if (ev.type === "error") throw new Error(ev.message);
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setGenState(s => ({ ...s, isGenerating: false, error: (err as Error).message }));
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${BASE}/api/research-lab/entries/${id}`, { method: "DELETE" });
      setEntries(e => e.filter(x => x.id !== id));
      loadStats();
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const filtered = entries.filter(e =>
    (filterCulture === "all" || e.culture === filterCulture) &&
    (filterEra === "all" || e.era === filterEra)
  );

  const coveragePercent = stats ? Math.round((stats.totalEntries / stats.totalPossible) * 100) : 0;

  return (
    <AppLayout>
      <GenerationProgress
        isGenerating={genState.isGenerating}
        progress={genState.progress}
        step={genState.step}
        error={genState.error}
        onCancel={() => { abortRef.current?.abort(); setGenState(s => ({ ...s, isGenerating: false })); }}
      />

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold">Laboratoire de Recherche</h1>
                  <p className="text-sm text-muted-foreground">Intelligence narrative mondiale — de l'Antiquité au contemporain</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mt-3">
                L'IA explore l'histoire du récit humain à travers toutes les cultures et époque — de la tradition orale africaine au cinéma coréen contemporain. 
                Chaque recherche extrait des <strong className="text-foreground">skills secrets</strong> que l'IA intègre progressivement à sa matrice créative.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDaily} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500" disabled={genState.isGenerating}>
                <Sparkles className="w-4 h-4" />
                Recherche du jour
              </Button>
              <Button variant="outline" onClick={() => setShowGenerator(g => !g)} className="gap-2" disabled={genState.isGenerating}>
                <FlaskConical className="w-4 h-4" />
                Manuel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary/70" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Entrées</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
              <p className="text-xs text-muted-foreground">recherches générées</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe2 className="w-4 h-4 text-cyan-400/70" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Cultures</span>
              </div>
              <p className="text-2xl font-bold">{stats.culturesExplored}<span className="text-sm text-muted-foreground font-normal">/{taxonomy?.cultures.length ?? 8}</span></p>
              <p className="text-xs text-muted-foreground">traditions explorées</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-400/70" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Époques</span>
              </div>
              <p className="text-2xl font-bold">{stats.erasExplored}<span className="text-sm text-muted-foreground font-normal">/{taxonomy?.eras.length ?? 10}</span></p>
              <p className="text-xs text-muted-foreground">périodes couvertes</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-violet-400/70" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Skills</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalSkillsExtracted}</p>
              <p className="text-xs text-muted-foreground">skills secrets extraits</p>
            </div>
          </div>
        )}

        {/* Coverage bar */}
        {stats && stats.totalEntries > 0 && (
          <div className="mb-8 rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-medium">Couverture de la matrice mondiale</span>
              </div>
              <span className="text-xs text-muted-foreground">{stats.totalEntries}/{stats.totalPossible} combinaisons</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${coveragePercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{coveragePercent}% de la matrice culturelle couverte</p>
          </div>
        )}

        {/* Manual Generator */}
        {showGenerator && taxonomy && (
          <div className="mb-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-violet-400" />
              Génération manuelle
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Époque</label>
                <select value={selectedEra} onChange={e => setSelectedEra(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Choisir une ère...</option>
                  {taxonomy.eras.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Culture</label>
                <select value={selectedCulture} onChange={e => setSelectedCulture(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Choisir une culture...</option>
                  {taxonomy.cultures.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Médium</label>
                <select value={selectedMedium} onChange={e => setSelectedMedium(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                  {taxonomy.mediums.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
              </div>
            </div>
            {selectedEra && selectedCulture && taxonomy && (
              <div className="text-xs text-muted-foreground mb-4 bg-black/20 rounded-lg p-3">
                <strong className="text-foreground">{taxonomy.eras.find(e => e.key === selectedEra)?.label}</strong> × <strong className="text-foreground">{taxonomy.cultures.find(c => c.key === selectedCulture)?.label}</strong> — {taxonomy.eras.find(e => e.key === selectedEra)?.desc}
              </div>
            )}
            <Button onClick={handleGenerate} disabled={!selectedEra || !selectedCulture || genState.isGenerating} className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Lancer la recherche
            </Button>
          </div>
        )}

        {/* Filters */}
        {(entries.length > 0 || loaded) && taxonomy && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">Culture :</span>
              <button onClick={() => setFilterCulture("all")} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", filterCulture === "all" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                Toutes
              </button>
              {taxonomy.cultures.filter(c => entries.some(e => e.culture === c.key)).map(c => (
                <button key={c.key} onClick={() => setFilterCulture(c.key)} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", filterCulture === c.key ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            {taxonomy.eras.some(e => entries.some(x => x.era === e.key)) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">Époque :</span>
                <button onClick={() => setFilterEra("all")} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", filterEra === "all" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                  Toutes
                </button>
                {taxonomy.eras.filter(e => entries.some(x => x.era === e.key)).map(e => (
                  <button key={e.key} onClick={() => setFilterEra(e.key)} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", filterEra === e.key ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                    {e.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Entries */}
        {!loaded ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(entry => (
              <EntryCard key={entry.id} entry={entry} cultures={taxonomy?.cultures ?? []} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-10 h-10 text-violet-400/60" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Le laboratoire est vide</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Lancez la <strong className="text-foreground">Recherche du jour</strong> pour que l'IA explore automatiquement une tradition narrative mondiale et en extrait des skills secrets pour enrichir votre matrice créative.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button onClick={handleDaily} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8" size="lg" disabled={genState.isGenerating}>
                <Sparkles className="w-5 h-5" />
                Lancer la première recherche
              </Button>
              <p className="text-xs text-muted-foreground">L'IA choisit automatiquement la tradition la plus riche à explorer</p>
            </div>

            {/* Cultural map preview */}
            {taxonomy && (
              <div className="mt-12 max-w-2xl mx-auto">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">Cultures à explorer</p>
                <div className="grid grid-cols-4 gap-2">
                  {taxonomy.cultures.map(c => (
                    <div key={c.key} className={cn("rounded-xl border p-3 text-center", CULTURE_COLORS[c.key] ?? "border-border/30")}>
                      <div className="text-2xl mb-1">{c.icon}</div>
                      <p className="text-xs font-medium leading-tight">{c.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{taxonomy.eras.length} époques</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
