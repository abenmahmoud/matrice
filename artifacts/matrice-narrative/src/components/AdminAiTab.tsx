/**
 * AdminAiTab — panneaux Super Admin pour:
 * - AiSkillsPanel  : CRUD des skills injectés dans les prompts IA
 * - CinemaPannel   : Base de connaissances cinéma mondial
 * - AiStatsPanel   : Stats d'utilisation
 * - SeedPanel      : Seed initial / réinitialisation
 */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight,
  Loader2, Check, X, Sparkles, Film, Database, Zap, Globe, BarChart3,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Types ───────────────────────────────────────────────────────────────────

export type AiSkill = {
  id: string; name: string; category: string; description: string;
  content: string; isActive: boolean; priority: number;
  injectionContexts: string[]; usageCount: number;
};

export type CinemaEntry = {
  id: string; country: string; region: string; era: string;
  movement: string; director: string; films: string[];
  techniques: string[]; culturalContext: string;
  narrativeSignatures: string; tags: string[]; isActive: boolean;
};

type AiStats = {
  skills: { total: number; active: number; totalUsage: number };
  cinema: { total: number; active: number };
  topSkills: { id: string; name: string; usageCount: number; category: string }[];
};

const SKILL_CATEGORIES = [
  "technique-narrative", "histoire-cinema", "style-auteur",
  "culture-regionale", "standards-pro", "structure-dramatique",
];
const CAT_COLORS: Record<string, string> = {
  "technique-narrative": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "histoire-cinema": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "style-auteur": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "culture-regionale": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "standards-pro": "bg-green-500/20 text-green-300 border-green-500/30",
  "structure-dramatique": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};
const REGIONS = ["Europe", "Asie", "Amérique latine", "Amérique du Nord", "Afrique", "Moyen-Orient", "Océanie"];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TabWrap({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>;
}

// ─── AI SKILLS PANEL ─────────────────────────────────────────────────────────

export function AiSkillsPanel({ adminHeaders }: { adminHeaders: () => Record<string, string> }) {
  const { toast } = useToast();
  const [skills, setSkills] = useState<AiSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AiSkill | null>(null);
  const [creating, setCreating] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/ai-skills`, { headers: adminHeaders() });
      if (res.ok) setSkills(await res.json() as AiSkill[]);
    } finally { setLoading(false); }
  }, [adminHeaders]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (skill: AiSkill) => {
    const res = await fetch(`${BASE}/api/admin/ai-skills/${skill.id}`, {
      method: "PATCH", headers: adminHeaders(),
      body: JSON.stringify({ isActive: !skill.isActive }),
    });
    if (res.ok) setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, isActive: !s.isActive } : s));
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer ce skill ?")) return;
    await fetch(`${BASE}/api/admin/ai-skills/${id}`, { method: "DELETE", headers: adminHeaders() });
    setSkills(prev => prev.filter(s => s.id !== id));
    toast({ title: "Skill supprimé" });
  };

  const save = async (data: Partial<AiSkill>) => {
    if (editing) {
      const res = await fetch(`${BASE}/api/admin/ai-skills/${editing.id}`, {
        method: "PATCH", headers: adminHeaders(), body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json() as AiSkill;
        setSkills(prev => prev.map(s => s.id === editing.id ? updated : s));
      }
      setEditing(null);
    } else {
      const res = await fetch(`${BASE}/api/admin/ai-skills`, {
        method: "POST", headers: adminHeaders(), body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json() as AiSkill;
        setSkills(prev => [created, ...prev]);
      }
      setCreating(false);
    }
    toast({ title: editing ? "Skill mis à jour" : "Skill créé" });
  };

  const visible = filterCat === "all" ? skills : skills.filter(s => s.category === filterCat);
  const activeCount = skills.filter(s => s.isActive).length;

  if (creating || editing) {
    return <SkillForm skill={editing} onSave={(d) => void save(d)} onCancel={() => { setCreating(false); setEditing(null); }} />;
  }

  return (
    <TabWrap>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Skills d'injection IA</h2>
          <p className="text-sm text-white/30 mt-0.5">
            <strong className="text-violet-300">{activeCount}</strong>/{skills.length} actifs — injectés dans chaque prompt de génération
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="p-2 text-white/30 hover:text-white/70 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500/80 text-white border border-violet-500/40 transition-all">
            <Plus className="w-3.5 h-3.5" />Nouveau skill
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["all", ...SKILL_CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filterCat === cat ? "bg-violet-600/80 text-white border-violet-500/40" : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/60")}>
            {cat === "all" ? `Tous (${skills.length})` : `${cat} (${skills.filter(s => s.category === cat).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-violet-400/40" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.06] rounded-2xl">
          <Sparkles className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">Aucun skill — utilisez le Seed pour initialiser</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(skill => (
            <div key={skill.id} className={cn("rounded-xl border overflow-hidden transition-all",
              skill.isActive ? "border-violet-500/25 bg-violet-500/[0.04]" : "border-white/[0.06] bg-white/[0.015] opacity-60")}>
              <div className="flex items-start gap-3 p-3">
                <button onClick={() => void toggle(skill)} className="mt-0.5 flex-shrink-0">
                  {skill.isActive
                    ? <ToggleRight className="w-5 h-5 text-violet-400" />
                    : <ToggleLeft className="w-5 h-5 text-white/20" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-sm font-medium", skill.isActive ? "text-white" : "text-white/40")}>{skill.name}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", CAT_COLORS[skill.category] ?? "bg-white/5 text-white/30 border-white/10")}>
                      {skill.category}
                    </span>
                    <span className="text-[10px] text-white/20">p:{skill.priority}</span>
                    {skill.usageCount > 0 && (
                      <span className="text-[10px] text-green-400/60">{skill.usageCount}× utilisé</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 line-clamp-1">{skill.description}</p>
                  <p className="text-[11px] text-white/25 mt-0.5 line-clamp-2 font-mono">{skill.content}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(skill.injectionContexts as string[]).map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] rounded border border-white/[0.08] text-white/30">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(skill)} className="p-1.5 text-white/20 hover:text-white/60 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => void del(skill.id)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TabWrap>
  );
}

// ─── Skill Form ───────────────────────────────────────────────────────────────

function SkillForm({ skill, onSave, onCancel }: { skill: AiSkill | null; onSave: (d: Partial<AiSkill>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: skill?.name ?? "",
    category: skill?.category ?? "technique-narrative",
    description: skill?.description ?? "",
    content: skill?.content ?? "",
    priority: skill?.priority ?? 70,
    isActive: skill?.isActive ?? true,
    injectionContexts: (skill?.injectionContexts as string[]) ?? ["all"],
  });

  const toggleCtx = (ctx: string) => {
    setForm(f => ({
      ...f,
      injectionContexts: f.injectionContexts.includes(ctx)
        ? f.injectionContexts.filter(c => c !== ctx)
        : [...f.injectionContexts, ctx],
    }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">{skill ? "Modifier le skill" : "Nouveau skill d'injection IA"}</h2>
        <button onClick={onCancel} className="text-white/30 hover:text-white/70"><X className="w-4 h-4" /></button>
      </div>
      <input placeholder="Nom du skill" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm px-4 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
      <div className="flex gap-3">
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-violet-500/40">
          {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="Priorité 0-100" value={form.priority}
          onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
          className="w-32 h-10 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
      </div>
      <input placeholder="Description courte (visible dans le Studio)" value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm px-4 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40" />
      <textarea placeholder="Contenu — texte injecté dans les prompts IA (soyez précis et actionnable)" value={form.content}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        className="w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 text-white/80 text-xs px-4 py-3 font-mono placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-y" />
      <div>
        <p className="text-xs text-white/30 mb-2">Contextes d'injection :</p>
        <div className="flex gap-2 flex-wrap">
          {["roman", "scenario", "pitch", "note-intention", "all"].map(ctx => (
            <button key={ctx} onClick={() => toggleCtx(ctx)}
              className={cn("px-3 py-1 rounded-full text-xs border transition-colors",
                form.injectionContexts.includes(ctx) ? "bg-violet-600/80 text-white border-violet-500/40" : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/60")}>
              {ctx}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all">
          <Check className="w-4 h-4" />{skill ? "Mettre à jour" : "Créer le skill"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors">
          Annuler
        </button>
      </div>
    </motion.div>
  );
}

// ─── CINEMA PANEL ─────────────────────────────────────────────────────────────

export function CinemaPanel({ adminHeaders }: { adminHeaders: () => Record<string, string> }) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CinemaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CinemaEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [filterRegion, setFilterRegion] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/cinema`, { headers: adminHeaders() });
      if (res.ok) setEntries(await res.json() as CinemaEntry[]);
    } finally { setLoading(false); }
  }, [adminHeaders]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (entry: CinemaEntry) => {
    const res = await fetch(`${BASE}/api/admin/cinema/${entry.id}`, {
      method: "PATCH", headers: adminHeaders(),
      body: JSON.stringify({ isActive: !entry.isActive }),
    });
    if (res.ok) setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, isActive: !e.isActive } : e));
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    await fetch(`${BASE}/api/admin/cinema/${id}`, { method: "DELETE", headers: adminHeaders() });
    setEntries(prev => prev.filter(e => e.id !== id));
    toast({ title: "Entrée supprimée" });
  };

  const save = async (data: Partial<CinemaEntry>) => {
    if (editing) {
      const res = await fetch(`${BASE}/api/admin/cinema/${editing.id}`, {
        method: "PATCH", headers: adminHeaders(), body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json() as CinemaEntry;
        setEntries(prev => prev.map(e => e.id === editing.id ? updated : e));
      }
      setEditing(null);
    } else {
      const res = await fetch(`${BASE}/api/admin/cinema`, {
        method: "POST", headers: adminHeaders(), body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json() as CinemaEntry;
        setEntries(prev => [created, ...prev]);
      }
      setCreating(false);
    }
    toast({ title: editing ? "Entrée mise à jour" : "Entrée créée" });
  };

  const visible = entries
    .filter(e => filterRegion === "all" || e.region === filterRegion)
    .filter(e => !search.trim() ||
      e.director.toLowerCase().includes(search.toLowerCase()) ||
      e.country.toLowerCase().includes(search.toLowerCase()) ||
      e.movement.toLowerCase().includes(search.toLowerCase()) ||
      e.era.toLowerCase().includes(search.toLowerCase()));

  const activeCount = entries.filter(e => e.isActive).length;

  if (creating || editing) {
    return <CinemaForm entry={editing} onSave={(d) => void save(d)} onCancel={() => { setCreating(false); setEditing(null); }} />;
  }

  return (
    <TabWrap>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Base cinéma mondial</h2>
          <p className="text-sm text-white/30 mt-0.5">
            <strong className="text-blue-300">{activeCount}</strong>/{entries.length} entrées actives — contexte injecté si références mentionnées
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="p-2 text-white/30 hover:text-white/70 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500/80 text-white border border-blue-500/40 transition-all">
            <Plus className="w-3.5 h-3.5" />Ajouter
          </button>
        </div>
      </div>

      {/* Region filters + search */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {["all", ...REGIONS.filter(r => entries.some(e => e.region === r))].map(r => (
          <button key={r} onClick={() => setFilterRegion(r)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filterRegion === r ? "bg-blue-600/80 text-white border-blue-500/40" : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/60")}>
            {r === "all" ? `Tout (${entries.length})` : `${r} (${entries.filter(e => e.region === r).length})`}
          </button>
        ))}
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="ml-auto h-8 w-40 rounded-lg border border-white/10 bg-white/5 text-white/70 text-xs px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400/40" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.06] rounded-2xl">
          <Film className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">Aucune entrée — utilisez le Seed pour initialiser</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {visible.map(entry => (
            <div key={entry.id} className={cn("rounded-xl border p-4 transition-all",
              entry.isActive ? "border-white/[0.08] bg-white/[0.025]" : "border-white/[0.04] bg-white/[0.01] opacity-50")}>
              <div className="flex items-start gap-2 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-white/90 truncate">{entry.director || entry.movement}</span>
                    <span className="text-[10px] text-white/30 shrink-0">{entry.country} · {entry.era}</span>
                  </div>
                  {entry.movement && <p className="text-[10px] text-blue-300/60 mb-1 italic truncate">{entry.movement}</p>}
                  <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{entry.narrativeSignatures}</p>
                  {entry.films.length > 0 && (
                    <p className="text-[10px] text-white/20 mt-1 truncate">
                      {(entry.films as string[]).slice(0, 3).join(" · ")}
                    </p>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {(entry.tags as string[]).slice(0, 4).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] rounded border border-white/[0.07] text-white/25">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => void toggle(entry)} className="p-1 text-white/20 hover:text-white/60">
                    {entry.isActive ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing(entry)} className="p-1 text-white/20 hover:text-white/60">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => void del(entry.id)} className="p-1 text-white/20 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TabWrap>
  );
}

// ─── Cinema Form ──────────────────────────────────────────────────────────────

function CinemaForm({ entry, onSave, onCancel }: { entry: CinemaEntry | null; onSave: (d: Partial<CinemaEntry>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    country: entry?.country ?? "",
    region: entry?.region ?? "Europe",
    era: entry?.era ?? "2000s",
    movement: entry?.movement ?? "",
    director: entry?.director ?? "",
    films: (entry?.films as string[] ?? []).join(", "),
    techniques: (entry?.techniques as string[] ?? []).join(", "),
    culturalContext: entry?.culturalContext ?? "",
    narrativeSignatures: entry?.narrativeSignatures ?? "",
    tags: (entry?.tags as string[] ?? []).join(", "),
    isActive: entry?.isActive ?? true,
  });

  const inp = (label: string, key: keyof typeof form, placeholder = "") => (
    <div>
      <label className="text-xs text-white/30 mb-1 block">{label}</label>
      <input value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full h-9 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm px-3 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
    </div>
  );

  const submit = () => {
    onSave({
      ...form,
      films: form.films.split(",").map(s => s.trim()).filter(Boolean),
      techniques: form.techniques.split(",").map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">{entry ? "Modifier l'entrée cinéma" : "Nouvelle entrée cinéma"}</h2>
        <button onClick={onCancel} className="text-white/30 hover:text-white/70"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {inp("Pays", "country", "ex: France")}
        <div>
          <label className="text-xs text-white/30 mb-1 block">Région</label>
          <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
            className="w-full h-9 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-blue-500/40">
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {inp("Réalisateur", "director", "ex: Jean-Luc Godard")}
        {inp("Époque", "era", "ex: 1960s")}
      </div>
      {inp("Mouvement cinématographique", "movement", "ex: Nouvelle Vague")}
      {inp("Films (séparés par virgule)", "films", "ex: À bout de souffle, Alphaville")}
      {inp("Techniques (séparées par virgule)", "techniques", "ex: Jump cut, Plan-séquence")}
      <div>
        <label className="text-xs text-white/30 mb-1 block">Signatures narratives</label>
        <textarea value={form.narrativeSignatures} onChange={e => setForm(f => ({ ...f, narrativeSignatures: e.target.value }))}
          placeholder="Ce qui définit la façon de raconter de ce cinéaste/mouvement..."
          className="w-full min-h-[80px] rounded-xl border border-white/10 bg-white/5 text-white/80 text-xs px-3 py-2.5 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-y" />
      </div>
      <div>
        <label className="text-xs text-white/30 mb-1 block">Contexte culturel</label>
        <textarea value={form.culturalContext} onChange={e => setForm(f => ({ ...f, culturalContext: e.target.value }))}
          placeholder="Contexte historique, social, politique..."
          className="w-full min-h-[60px] rounded-xl border border-white/10 bg-white/5 text-white/80 text-xs px-3 py-2.5 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-y" />
      </div>
      {inp("Tags (séparés par virgule)", "tags", "ex: politique, corps, temps")}
      <div className="flex gap-3 pt-2">
        <button onClick={submit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium transition-all">
          <Check className="w-4 h-4" />{entry ? "Mettre à jour" : "Créer l'entrée"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors">
          Annuler
        </button>
      </div>
    </motion.div>
  );
}

// ─── STATS PANEL ─────────────────────────────────────────────────────────────

export function AiStatsPanel({ adminHeaders }: { adminHeaders: () => Record<string, string> }) {
  const [stats, setStats] = useState<AiStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/stats`, { headers: adminHeaders() });
      if (res.ok) setStats(await res.json() as AiStats);
    } finally { setLoading(false); }
  }, [adminHeaders]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-violet-400/40" /></div>;
  if (!stats) return null;

  return (
    <TabWrap>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Stats moteur IA</h2>
        <p className="text-sm text-white/30 mt-0.5">Utilisation des skills d'injection</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Skills actifs", val: `${stats.skills.active} / ${stats.skills.total}`, Icon: Sparkles, color: "text-violet-400" },
          { label: "Utilisations totales", val: stats.skills.totalUsage ?? 0, Icon: Zap, color: "text-amber-400" },
          { label: "Entrées cinéma", val: `${stats.cinema.active} / ${stats.cinema.total}`, Icon: Film, color: "text-blue-400" },
          { label: "Couverture active", val: `${Math.round((stats.cinema.active / Math.max(stats.cinema.total, 1)) * 100)}%`, Icon: Globe, color: "text-green-400" },
        ].map(({ label, val, Icon, color }) => (
          <div key={label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className={cn("mb-2", color)}><Icon className="w-4 h-4" /></div>
            <p className="text-2xl font-bold text-white">{val}</p>
            <p className="text-xs text-white/30 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {stats.topSkills.length > 0 && (
        <div>
          <p className="text-xs text-white/20 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />Top skills les plus utilisés
          </p>
          <div className="space-y-2">
            {stats.topSkills.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="text-xs text-white/20 w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{s.name}</p>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", CAT_COLORS[s.category] ?? "bg-white/5 text-white/30 border-white/10")}>
                    {s.category}
                  </span>
                </div>
                <span className="text-sm font-bold text-green-400 shrink-0">{s.usageCount}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </TabWrap>
  );
}

// ─── SEED PANEL ───────────────────────────────────────────────────────────────

export function SeedPanel({ adminHeaders }: { adminHeaders: () => Record<string, string> }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; skills?: number; cinema?: number; seeded?: boolean } | null>(null);

  const seed = async (force: boolean) => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/api/admin/seed`, {
        method: "POST", headers: adminHeaders(),
        body: JSON.stringify({ force }),
      });
      const data = await res.json() as { message: string; skills?: number; cinema?: number; seeded?: boolean };
      setResult(data);
      toast({ title: data.message });
    } finally { setLoading(false); }
  };

  return (
    <TabWrap>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Seed de la base de connaissances</h2>
        <p className="text-sm text-white/30 mt-0.5">Initialise ou réinitialise les skills IA et la base cinéma mondial</p>
      </div>

      <div className="space-y-4 max-w-xl">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <Database className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Seed initial</p>
              <p className="text-xs text-white/30">Peuple uniquement si les tables sont vides</p>
            </div>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Charge <strong className="text-white/60">22 skills narratifs</strong> (technique, histoire cinéma, style auteur, culture régionale, standards pro) et <strong className="text-white/60">30+ entrées cinéma mondial</strong> couvrant la Nouvelle Vague, le Néoréalisme, le cinéma coréen, iranien, soviétique, japonais, latino-américain, africain et plus encore.
          </p>
          <button onClick={() => void seed(false)} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-medium transition-all shadow-[0_4px_20px_rgba(139,92,246,0.25)]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Seed initial
          </button>
        </div>

        <div className="p-5 rounded-2xl border border-red-500/15 bg-red-500/[0.02] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-300">Seed forcé</p>
              <p className="text-xs text-white/30">Efface tout et réinitialise — irréversible</p>
            </div>
          </div>
          <button onClick={() => void seed(true)} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all disabled:opacity-40">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Réinitialiser et reseeder
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={cn("p-4 rounded-xl border", result.seeded === false ? "border-amber-500/20 bg-amber-500/[0.05]" : "border-green-500/20 bg-green-500/[0.05]")}>
            <p className={cn("text-sm font-medium", result.seeded === false ? "text-amber-300" : "text-green-300")}>
              {result.message}
            </p>
            {result.skills !== undefined && (
              <p className="text-xs text-white/40 mt-1">{result.skills} skills · {result.cinema} entrées cinéma</p>
            )}
          </motion.div>
        )}
      </div>
    </TabWrap>
  );
}
