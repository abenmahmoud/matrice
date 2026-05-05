import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Archive, Ban, BookOpen, BrainCircuit, CheckCircle2, Compass, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type MemoryCategory = "creative_rules" | "narrative_bans" | "references" | "motifs" | "quality_criteria" | "art_direction";
type MemoryEntry = {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  priority: number;
  isActive: boolean;
};

const CATEGORIES: Array<{ value: MemoryCategory; label: string; icon: React.ElementType; tone: string }> = [
  { value: "creative_rules", label: "Regles creatives", icon: CheckCircle2, tone: "text-emerald-300 border-emerald-400/20 bg-emerald-500/10" },
  { value: "narrative_bans", label: "Interdits", icon: Ban, tone: "text-rose-300 border-rose-400/20 bg-rose-500/10" },
  { value: "references", label: "References fortes", icon: Archive, tone: "text-blue-300 border-blue-400/20 bg-blue-500/10" },
  { value: "motifs", label: "Motifs recurrents", icon: BrainCircuit, tone: "text-violet-300 border-violet-400/20 bg-violet-500/10" },
  { value: "quality_criteria", label: "Criteres qualite", icon: Star, tone: "text-amber-300 border-amber-400/20 bg-amber-500/10" },
  { value: "art_direction", label: "Direction artistique", icon: Compass, tone: "text-cyan-300 border-cyan-400/20 bg-cyan-500/10" },
];

const emptyForm = { category: "creative_rules" as MemoryCategory, title: "", content: "", tags: "", priority: 50, isActive: true };

function categoryMeta(category: MemoryCategory) {
  return CATEGORIES.find((item) => item.value === category) ?? CATEGORIES[0];
}

export default function MemoryPage() {
  const { adminHeaders } = useAdmin();
  const { toast } = useToast();
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MemoryCategory | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/memory`, { headers: adminHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEntries(await res.json() as MemoryEntry[]);
      setLoaded(true);
    } catch {
      toast({ title: "Memoire indisponible", description: "Connecte-toi en admin si necessaire.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!loaded && !loading) void loadEntries();

  const filteredEntries = useMemo(
    () => entries.filter((entry) => activeCategory === "all" || entry.category === activeCategory),
    [activeCategory, entries],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const editEntry = (entry: MemoryEntry) => {
    setEditingId(entry.id);
    setForm({ category: entry.category, title: entry.title, content: entry.content, tags: entry.tags.join(", "), priority: entry.priority, isActive: entry.isActive });
  };

  const saveEntry = async () => {
    if (!form.title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" });
      return;
    }

    const payload = { ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), priority: Number(form.priority) };

    try {
      const res = await fetch(`${BASE}/api/memory${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json() as MemoryEntry;
      setEntries((current) => editingId ? current.map((entry) => entry.id === saved.id ? saved : entry) : [saved, ...current]);
      resetForm();
      toast({ title: "Memoire sauvegardee" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder cette memoire.", variant: "destructive" });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/api/memory/${id}`, { method: "DELETE", headers: adminHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEntries((current) => current.filter((entry) => entry.id !== id));
      toast({ title: "Memoire supprimee" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer cette memoire.", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">
        <div className="border-b border-white/[0.05] bg-white/[0.01]">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-8 py-8">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300/40">Memoire creative privee</p>
              <h1 className="text-3xl font-serif font-bold text-white/90">Ce que Matrice doit apprendre de toi</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/32">Rassemble tes regles, interdits, references, motifs et criteres. Cette V1 servira ensuite aux generations IA.</p>
            </div>
            <Button onClick={resetForm} className="rounded-xl bg-primary/90 text-white hover:bg-primary"><Plus className="mr-2 h-4 w-4" />Nouvelle entree</Button>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 px-8 py-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-5">
            <div className="mb-5 flex items-center gap-2"><BookOpen className="h-4 w-4 text-violet-300/60" /><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">{editingId ? "Modifier" : "Ajouter"}</p></div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/45">Categorie</label>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as MemoryCategory }))} className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#0d0d14] px-3 text-sm text-white/70 outline-none">
                  {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </div>
              <div><label className="mb-2 block text-xs font-semibold text-white/45">Titre</label><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="rounded-xl border-white/[0.08] bg-white/[0.025] text-white/75" /></div>
              <div><label className="mb-2 block text-xs font-semibold text-white/45">Contenu</label><Textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="min-h-32 rounded-xl border-white/[0.08] bg-white/[0.025] text-white/75" /></div>
              <div><label className="mb-2 block text-xs font-semibold text-white/45">Tags, separes par virgules</label><Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className="rounded-xl border-white/[0.08] bg-white/[0.025] text-white/75" /></div>
              <div><label className="mb-2 block text-xs font-semibold text-white/45">Priorite</label><Input type="number" min={0} max={100} value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: Number(event.target.value) }))} className="rounded-xl border-white/[0.08] bg-white/[0.025] text-white/75" /></div>
              <div className="flex gap-2"><Button onClick={() => void saveEntry()} className="flex-1 rounded-xl bg-primary/90 text-white hover:bg-primary">{editingId ? "Mettre a jour" : "Sauvegarder"}</Button>{editingId && <Button variant="outline" onClick={resetForm} className="rounded-xl border-white/[0.08] bg-white/[0.02] text-white/55">Annuler</Button>}</div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCategory("all")} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", activeCategory === "all" ? "border-white/20 bg-white/10 text-white/80" : "border-white/[0.06] bg-white/[0.02] text-white/32")}>Tout</button>
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return <button key={category.value} onClick={() => setActiveCategory(category.value)} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", activeCategory === category.value ? category.tone : "border-white/[0.06] bg-white/[0.02] text-white/32")}><Icon className="h-3.5 w-3.5" />{category.label}</button>;
              })}
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary/50" /></div> : filteredEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] p-10 text-center"><BrainCircuit className="mx-auto h-9 w-9 text-white/18" /><p className="mt-4 text-sm font-semibold text-white/55">Aucune memoire dans cette vue</p><p className="mt-1 text-xs text-white/25">Ajoute une premiere regle, reference ou obsession narrative.</p></div>
            ) : (
              <div className="grid gap-4">
                {filteredEntries.map((entry) => {
                  const meta = categoryMeta(entry.category);
                  const Icon = meta.icon;
                  return (
                    <article key={entry.id} className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div><Badge className={cn("mb-3", meta.tone)}><Icon className="mr-1.5 h-3.5 w-3.5" />{meta.label}</Badge><h2 className="text-lg font-serif font-bold text-white/85">{entry.title}</h2></div>
                        <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => editEntry(entry)} className="h-8 w-8 text-white/35 hover:text-white"><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void deleteEntry(entry.id)} className="h-8 w-8 text-rose-300/45 hover:text-rose-200"><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                      {entry.content && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/42">{entry.content}</p>}
                      {entry.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{entry.tags.map((tag) => <span key={tag} className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-white/35">{tag}</span>)}</div>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
