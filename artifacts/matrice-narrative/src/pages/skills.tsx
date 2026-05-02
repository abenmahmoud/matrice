import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Trash2, Edit3, Check, X, Zap, 
  Palette, GitBranch, Globe2, Users, BookOpen, Lightbulb, Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

type SkillCategory = "style" | "structure" | "theme" | "character" | "world" | "technique" | "custom";

type Skill = {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  promptContent: string;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES: { value: SkillCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: "style", label: "Style d'écriture", icon: Palette, color: "text-violet-400 bg-violet-400/10 border-violet-400/30" },
  { value: "structure", label: "Structure narrative", icon: GitBranch, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { value: "theme", label: "Thématique", icon: Lightbulb, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  { value: "character", label: "Personnages", icon: Users, color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { value: "world", label: "Univers & Monde", icon: Globe2, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30" },
  { value: "technique", label: "Technique narrative", icon: BookOpen, color: "text-rose-400 bg-rose-400/10 border-rose-400/30" },
  { value: "custom", label: "Personnalisé", icon: Wand2, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" },
];

const EXAMPLES = [
  { name: "Style minimaliste", category: "style" as SkillCategory, description: "Écriture sobre et dépouillée, influence Carver", promptContent: "Adopte un style d'écriture minimaliste : phrases courtes, vocabulaire précis et sobre, pas d'adjectifs superflus. Les sous-entendus priment sur l'explicite. L'émotion naît de la retenue, pas de l'emphase. Influence : Raymond Carver, Ernest Hemingway." },
  { name: "Structure non-linéaire", category: "structure" as SkillCategory, description: "Récit à boucles temporelles, narration fragmentée", promptContent: "Structure le récit de façon non-linéaire : sauts temporels, analepses et prolepses entrelacées. Le lecteur/spectateur reconstitue la chronologie par fragments. Chaque fragment doit révéler une couche cachée. Influence : Christopher Nolan, Alain Robbe-Grillet." },
  { name: "Monde magique systémique", category: "world" as SkillCategory, description: "Magie avec règles strictes et conséquences", promptContent: "Le système de magie ou les lois surnaturelles doivent être rigoureux, cohérents et porter un coût narratif. Chaque pouvoir a une limite précise. L'abus du système entraîne des conséquences dramatiques irréversibles. Influence : Brandon Sanderson (lois de la magie)." },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SkillsPage() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<SkillCategory | "all">("all");
  const [form, setForm] = useState({ name: "", description: "", category: "style" as SkillCategory, promptContent: "", isActive: true });

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/skills`);
      const data = await res.json();
      setSkills(data);
      setLoaded(true);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les skills", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!loaded && !loading) loadSkills();

  const handleSave = async () => {
    if (!form.name.trim() || !form.promptContent.trim()) {
      toast({ title: "Champs requis", description: "Le nom et le contenu du prompt sont obligatoires", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        const res = await fetch(`${BASE}/api/skills/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setSkills(s => s.map(sk => sk.id === editingId ? updated : sk));
        toast({ title: "Skill mis à jour" });
      } else {
        const res = await fetch(`${BASE}/api/skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, isGlobal: true }),
        });
        const created = await res.json();
        setSkills(s => [created, ...s]);
        toast({ title: "Skill créé", description: `"${created.name}" est maintenant disponible` });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "", category: "style", promptContent: "", isActive: true });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le skill", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${BASE}/api/skills/${id}`, { method: "DELETE" });
      setSkills(s => s.filter(sk => sk.id !== id));
      toast({ title: "Skill supprimé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le skill", variant: "destructive" });
    }
  };

  const toggleActive = async (skill: Skill) => {
    try {
      const res = await fetch(`${BASE}/api/skills/${skill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !skill.isActive }),
      });
      const updated = await res.json();
      setSkills(s => s.map(sk => sk.id === skill.id ? updated : sk));
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le skill", variant: "destructive" });
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setForm({ name: skill.name, description: skill.description, category: skill.category, promptContent: skill.promptContent, isActive: skill.isActive });
    setShowForm(true);
  };

  const useExample = (ex: typeof EXAMPLES[0]) => {
    setForm(f => ({ ...f, name: ex.name, description: ex.description, category: ex.category, promptContent: ex.promptContent }));
    setShowForm(true);
  };

  const getCat = (cat: string) => CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[6];

  const filtered = filterCategory === "all" ? skills : skills.filter(s => s.category === filterCategory);

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Skills IA</h1>
              <p className="text-sm text-muted-foreground">Entraînez l'IA avec vos propres règles narratives</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Les <strong className="text-foreground">Skills IA</strong> sont des instructions créatives personnalisées que vous injectez dans chaque génération. 
            Définissez votre style d'écriture, vos structures narratives préférées, vos règles d'univers — l'IA les apprend et les applique à tous vos projets.
          </p>
        </div>

        {/* Filter + Actions */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all", filterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}
            >
              Tous ({skills.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = skills.filter(s => s.category === cat.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all", filterCategory === cat.value ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10")}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
          <Button onClick={() => { setEditingId(null); setForm({ name: "", description: "", category: "style", promptContent: "", isActive: true }); setShowForm(true); }} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Nouveau skill
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="text-base font-semibold mb-4">{editingId ? "Modifier le skill" : "Créer un nouveau skill"}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nom du skill *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Style minimaliste à la Carver" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Catégorie</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as SkillCategory }))}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">Description courte</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Une ligne pour décrire ce skill" />
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1 block">Contenu du prompt (instructions pour l'IA) *</label>
              <Textarea
                value={form.promptContent}
                onChange={e => setForm(f => ({ ...f, promptContent: e.target.value }))}
                placeholder="Écrivez ici les instructions précises que l'IA doit suivre. Soyez détaillé : style, contraintes, influences, règles spécifiques..."
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">Ce texte sera injecté dans les prompts de l'IA lors de chaque génération.</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                Actif (appliqué à toutes les générations)
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-1" /> {editingId ? "Mettre à jour" : "Créer le skill"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Skills list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-3">
            {filtered.map(skill => {
              const cat = getCat(skill.category);
              const CatIcon = cat.icon;
              return (
                <div key={skill.id} className={cn("rounded-xl border bg-card p-5 transition-all", skill.isActive ? "border-border opacity-100" : "border-border/30 opacity-50")}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5", cat.color)}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-medium text-sm">{skill.name}</h4>
                          <Badge variant="outline" className={cn("text-xs border", cat.color)}>{cat.label}</Badge>
                          {!skill.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">Désactivé</Badge>}
                        </div>
                        {skill.description && <p className="text-xs text-muted-foreground mb-2">{skill.description}</p>}
                        <p className="text-xs text-muted-foreground/70 font-mono bg-black/20 rounded-md p-2 line-clamp-2">{skill.promptContent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleActive(skill)} className={cn("p-1.5 rounded-md text-xs transition-all", skill.isActive ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-white/5")} title={skill.isActive ? "Désactiver" : "Activer"}>
                        <Zap className="w-4 h-4" />
                      </button>
                      <button onClick={() => startEdit(skill)} className="p-1.5 rounded-md text-muted-foreground hover:bg-white/5 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(skill.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun skill créé</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Créez vos premières règles narratives et l'IA les appliquera automatiquement à chaque génération.</p>

            {/* Examples */}
            <div className="max-w-2xl mx-auto">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">Exemples pour démarrer</p>
              <div className="grid gap-3">
                {EXAMPLES.map(ex => {
                  const cat = getCat(ex.category);
                  const Icon = cat.icon;
                  return (
                    <button key={ex.name} onClick={() => useExample(ex)} className="text-left rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 p-4 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0", cat.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{ex.name}</span>
                            <Badge variant="outline" className={cn("text-xs border", cat.color)}>{cat.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{ex.description}</p>
                        </div>
                        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">Utiliser →</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
