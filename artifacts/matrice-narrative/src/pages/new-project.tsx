import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";
import {
  Sparkles, ArrowRight, ArrowLeft, Clapperboard,
  Film, Tv, BookOpen, Mic, Gamepad2, Image, Check,
  BookText, ChevronDown, ChevronUp, Wand2
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MOODS = [
  { id: "onirique",     label: "Onirique",      emoji: "🌙", desc: "comme un rêve éveillé" },
  { id: "sombre",       label: "Sombre",         emoji: "🌑", desc: "profondément noir" },
  { id: "lumineux",     label: "Lumineux",       emoji: "✨", desc: "transcendant, épuré" },
  { id: "melancolique", label: "Mélancolique",   emoji: "🌧", desc: "d'une tristesse belle" },
  { id: "epique",       label: "Épique",         emoji: "⚡", desc: "grand, monumental" },
  { id: "brut",         label: "Brut & Cru",     emoji: "🔥", desc: "frontal, sans filtre" },
  { id: "silencieux",   label: "Silencieux",     emoji: "🤫", desc: "les mots non dits" },
  { id: "tendu",        label: "Tendu",          emoji: "⚙️", desc: "oppressant, étouffant" },
  { id: "mysterieux",   label: "Mystérieux",     emoji: "🔮", desc: "énigmatique, trouble" },
  { id: "solaire",      label: "Solaire",        emoji: "🌅", desc: "chaleureux, vivant" },
  { id: "glacial",      label: "Glacial",        emoji: "🧊", desc: "froid, clinique" },
  { id: "intime",       label: "Intime",         emoji: "🕯", desc: "personnel, proche" },
  { id: "sature",       label: "Saturé",         emoji: "🎨", desc: "couleurs saturées, vivaces" },
  { id: "desature",     label: "Désaturé",       emoji: "⬜", desc: "presque monochrome" },
  { id: "baroque",      label: "Baroque",        emoji: "🌺", desc: "riche, ornemental" },
  { id: "minimaliste",  label: "Minimaliste",    emoji: "◻️", desc: "dépouillé, essentiel" },
];

const FORMATS = [
  { id: "Film long métrage", label: "Film", sub: "long métrage", icon: Film },
  { id: "Court-métrage", label: "Court", sub: "métrage", icon: Clapperboard },
  { id: "Série TV", label: "Série TV", sub: "épisodique", icon: Tv },
  { id: "Mini-série", label: "Mini-série", sub: "3–6 épisodes", icon: Tv },
  { id: "Roman", label: "Roman", sub: "fiction", icon: BookOpen },
  { id: "Podcast narratif", label: "Podcast", sub: "narratif", icon: Mic },
  { id: "Jeu Vidéo", label: "Jeu", sub: "vidéo", icon: Gamepad2 },
  { id: "Bande Dessinée", label: "BD / Roman", sub: "graphique", icon: Image },
];

const GENRES = [
  "Thriller", "Drame", "Science-Fiction", "Horror", "Romance", "Fantasy",
  "Historique", "Crime", "Biopic", "Comédie", "Documentaire", "Néo-noir",
  "Cyberpunk", "Surréalisme", "Réalisme magique", "Film de genre",
];

const TONES = [
  "Sombre", "Mélancolique", "Onirique", "Épique", "Lyrique",
  "Cynique", "Cru", "Intime", "Contemplatif", "Absurde",
  "Mystérieux", "Poétique", "Tendu", "Lumineux", "Ironique",
];

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
const STEPS = [
  { n: 1, label: "L'Étincelle" },
  { n: 2, label: "L'Atmosphère" },
  { n: 3, label: "Les Références" },
  { n: 4, label: "Le Projet" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-14">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
              current === s.n
                ? "bg-violet-600 border-violet-400 text-white shadow-[0_0_16px_rgba(139,92,246,0.5)]"
                : current > s.n
                ? "bg-violet-800/60 border-violet-600/50 text-violet-300"
                : "bg-white/[0.04] border-white/[0.10] text-white/25"
            )}>
              {current > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span className={cn(
              "text-xs font-medium hidden sm:block",
              current === s.n ? "text-white/80" : current > s.n ? "text-white/40" : "text-white/20"
            )}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "w-8 sm:w-14 h-px mx-3",
              current > s.n ? "bg-violet-600/40" : "bg-white/[0.06]"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mood tile
// ---------------------------------------------------------------------------
function MoodTile({ mood, selected, onToggle }: {
  mood: typeof MOODS[0]; selected: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className={cn(
      "relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left group",
      selected
        ? "bg-violet-600/20 border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.14]"
    )}>
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <span className="text-2xl mb-2">{mood.emoji}</span>
      <p className={cn("text-sm font-bold leading-none", selected ? "text-violet-200" : "text-white/70")}>{mood.label}</p>
      <p className="text-[10px] text-white/30 mt-1">{mood.desc}</p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Format tile
// ---------------------------------------------------------------------------
function FormatTile({ f, selected, onSelect }: {
  f: typeof FORMATS[0]; selected: boolean; onSelect: () => void;
}) {
  return (
    <button onClick={onSelect} className={cn(
      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2",
      selected
        ? "bg-violet-600/20 border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.14]"
    )}>
      <f.icon className={cn("w-6 h-6", selected ? "text-violet-300" : "text-white/35")} />
      <div className="text-center">
        <p className={cn("text-sm font-bold leading-none", selected ? "text-violet-200" : "text-white/70")}>{f.label}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{f.sub}</p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type LinkedSkill = { id: string; name: string; category: string };

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — L'Étincelle
  const [spark, setSpark] = useState("");
  const [showManuscript, setShowManuscript] = useState(false);
  const [manuscriptExcerpt, setManuscriptExcerpt] = useState("");

  // Step 2 — L'Atmosphère
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  // Step 3 — Références
  const [references, setReferences] = useState("");

  // Step 4 — Le Projet
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("Film long métrage");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Thriller"]);
  const [selectedTones, setSelectedTones] = useState<string[]>(["Sombre"]);

  const toggleMood = (id: string) => {
    setSelectedMoods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const toggleGenre = (value: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(value)) return prev.length > 1 ? prev.filter(g => g !== value) : prev;
      return [...prev, value];
    });
  };

  const toggleTone = (value: string) => {
    setSelectedTones(prev => {
      if (prev.includes(value)) return prev.length > 1 ? prev.filter(t => t !== value) : prev;
      return [...prev, value];
    });
  };

  const canProceed = () => {
    if (step === 1) return spark.trim().length >= 10;
    if (step === 2) return selectedMoods.length >= 1;
    if (step === 3) return true;
    if (step === 4) return title.trim().length >= 2 && selectedGenres.length >= 1 && selectedTones.length >= 1;
    return false;
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSubmitting(true);
    try {
      const moodLabels = selectedMoods.map(id => MOODS.find(m => m.id === id)?.label ?? id);
      const body = {
        title: title.trim(),
        rawIdea: spark.trim(),
        genre: selectedGenres.join(", "),
        tone: selectedTones.join(", "),
        targetFormat: format,
        inspirationSources: spark.trim(),
        visualMoods: moodLabels,
        cinematicReferences: references.trim(),
        manuscriptExcerpt: manuscriptExcerpt.trim(),
        targetAudience: "Adultes exigeants, amateurs de cinéma d'auteur",
        artisticAmbition: `Créer une œuvre ${moodLabels.join(", ").toLowerCase()} qui résonne durablement`,
      };

      const res = await apiFetch(`${BASE}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message = "Création échouée";
        try {
          const payload = await res.json() as { error?: string };
          if (payload.error === "FREE_PROJECT_LIMIT_REACHED") {
            message = "Limite du plan gratuit atteinte. Les comptes admin peuvent générer sans cette limite après cette mise à jour.";
          } else if (payload.error === "AUTH_REQUIRED") {
            message = "Connexion requise. Reconnecte-toi puis relance la création.";
          } else if (payload.error === "INVALID_PROJECT_INPUT") {
            message = "Certains champs du projet sont incomplets ou invalides.";
          }
        } catch {
          // Message par défaut conservé si l'API ne renvoie pas de JSON.
        }
        throw new Error(message);
      }
      const project = await res.json() as { id: string };

      // Fire and forget: matrix generation (SSE)
      void apiFetch(`${BASE}/api/projects/${project.id}/generate-matrix`, {
        method: "POST",
        headers: { "Accept": "text/event-stream" },
      });

      // Fire and forget: auto-link skills — show toast when done
      void apiFetch(`${BASE}/api/projects/${project.id}/auto-link-skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json() as Promise<LinkedSkill[]>).then(skills => {
        if (skills.length > 0) {
          toast({
            title: `${skills.length} compétence${skills.length > 1 ? "s" : ""} narrative${skills.length > 1 ? "s" : ""} liée${skills.length > 1 ? "s" : ""}`,
            description: skills.map(s => s.name).join(" · "),
          });
        }
      }).catch(() => null);

      toast({
        title: "Vision capturée",
        description: "Matrice narrative en cours de génération...",
      });
      setLocation(`/projects/${project.id}/matrix`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error && err.message ? err.message : "Impossible de créer le projet.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const manuscriptWordCount = manuscriptExcerpt.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="matrice-work min-h-screen bg-matrice-ivoire text-matrice-encre flex flex-col">
      {/* Header */}
      <header className="border-b border-matrice-sable px-8 py-5 flex items-center justify-between sticky top-0 z-10 bg-matrice-ivoire/90 backdrop-blur-xl">
        <a href={`${import.meta.env.BASE_URL}`} className="font-serif font-bold text-sm tracking-[0.2em] text-violet-400 hover:text-violet-300 transition-colors">MATRICE</a>
        <div className="text-xs text-white/20">Nouvelle vision</div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-6 py-12 max-w-3xl mx-auto w-full">
        <StepBar current={step} />

        {/* ── STEP 1: L'Étincelle ───────────────────── */}
        {step === 1 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-violet-400/70 uppercase tracking-[0.2em] mb-4 border border-violet-500/20 rounded-full px-3 py-1.5">
                <Sparkles className="w-3 h-3" />Étape 1
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 tracking-tight">
                Quelle est<br /><span className="text-violet-300">votre étincelle ?</span>
              </h1>
              <p className="text-white/35 text-base max-w-lg mx-auto leading-relaxed">
                Un rêve, une image qui vous hante, une sensation, une scène que vous voyez.
                Pas besoin d'une histoire complète — juste l'essence brute.
              </p>
            </div>

            <textarea
              value={spark}
              onChange={e => setSpark(e.target.value)}
              placeholder={`"Je vois une femme debout dans une gare vide à 3h du matin. Autour d'elle, des valises abandonnées. Elle ne part pas — elle attend quelqu'un qui ne viendra jamais. Et elle le sait."\n\n— Ou bien : un rêve, une image, un sentiment impossible à nommer...`}
              className="w-full h-48 bg-white/[0.03] border border-white/[0.09] rounded-2xl p-5 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30 transition-all leading-relaxed"
              autoFocus
            />
            <p className={cn(
              "text-xs mt-2 text-right transition-colors",
              spark.length < 10 ? "text-white/15" : "text-violet-400/50"
            )}>{spark.length} caractères {spark.length >= 10 && "✓"}</p>

            {/* Manuscript toggle */}
            <div className="mt-5">
              <button
                onClick={() => setShowManuscript(s => !s)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                  showManuscript
                    ? "bg-violet-600/10 border-violet-500/30"
                    : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.12]"
                )}>
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  showManuscript ? "bg-violet-600/30" : "bg-white/[0.05]"
                )}>
                  <BookText className={cn("w-4 h-4", showManuscript ? "text-violet-300" : "text-white/30")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold leading-none",
                    showManuscript ? "text-violet-200" : "text-white/55"
                  )}>
                    J'ai un extrait de manuscrit ou un brouillon
                  </p>
                  <p className="text-xs text-white/22 mt-1.5 leading-snug">
                    Collez un texte — l'IA détectera votre style et liera les compétences narratives adaptées
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  {manuscriptWordCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/25 text-violet-300 border border-violet-500/30">
                      {manuscriptWordCount} mots
                    </span>
                  )}
                  {showManuscript
                    ? <ChevronUp className="w-4 h-4 text-violet-400/60" />
                    : <ChevronDown className="w-4 h-4 text-white/20" />
                  }
                </div>
              </button>

              {showManuscript && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea
                    value={manuscriptExcerpt}
                    onChange={e => setManuscriptExcerpt(e.target.value)}
                    placeholder={"Collez ici un extrait de votre brouillon, une scène, une page d'ouverture, des dialogues...\n\nL'IA analysera votre voix d'auteur et liera automatiquement les compétences narratives\nqui correspondent à votre style naturel et aux techniques à développer."}
                    className="w-full h-52 bg-white/[0.02] border border-violet-500/20 rounded-xl p-4 text-sm text-white/75 placeholder:text-white/18 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/25 transition-all leading-relaxed"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-white/20">Minimum recommandé : 50 mots</p>
                    {manuscriptWordCount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-violet-400/50">
                        <Wand2 className="w-3 h-3" />
                        Compétences auto-liées après création
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: L'Atmosphère ──────────────────── */}
        {step === 2 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-violet-400/70 uppercase tracking-[0.2em] mb-4 border border-violet-500/20 rounded-full px-3 py-1.5">
                <Sparkles className="w-3 h-3" />Étape 2
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 tracking-tight">
                Quelle est<br /><span className="text-violet-300">l'atmosphère ?</span>
              </h1>
              <p className="text-white/35 text-base max-w-lg mx-auto">
                Choisissez une ou plusieurs atmosphères visuelles. Elles guideront l'IA pour
                donner à votre matrice une sensibilité visuelle précise.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {MOODS.map(m => (
                <MoodTile key={m.id} mood={m} selected={selectedMoods.includes(m.id)} onToggle={() => toggleMood(m.id)} />
              ))}
            </div>
            {selectedMoods.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedMoods.map(id => {
                  const m = MOODS.find(x => x.id === id);
                  return m ? (
                    <span key={id} className="text-xs px-3 py-1.5 rounded-full bg-violet-600/25 text-violet-300 border border-violet-500/35">
                      {m.emoji} {m.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Les Références ────────────────── */}
        {step === 3 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-violet-400/70 uppercase tracking-[0.2em] mb-4 border border-violet-500/20 rounded-full px-3 py-1.5">
                <Sparkles className="w-3 h-3" />Étape 3
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 tracking-tight">
                Quelles sont<br /><span className="text-violet-300">vos références ?</span>
              </h1>
              <p className="text-white/35 text-base max-w-lg mx-auto leading-relaxed">
                Cinéastes, films, livres, musiques, photographes, peintres — tout ce qui résonne
                avec votre vision. L'IA s'en imprègnera pour construire votre matrice.
              </p>
            </div>

            <textarea
              value={references}
              onChange={e => setReferences(e.target.value)}
              placeholder={"Exemples :\n· Cinéma : Tarkovski, Wong Kar-wai, Arrival, 2001 A Space Odyssey, In the Mood for Love\n· Littérature : Cormac McCarthy, Murakami, Woolf, Duras\n· Musique : Arvo Pärt, Ennio Morricone, Erik Satie, Radiohead\n· Visuel : Edward Hopper, Gregory Crewdson, les couleurs de Paolo Sorrentino\n\nOu simplement : « l'ambiance des gares la nuit, les films des années 70, le sentiment du deuil »"}
              className="w-full h-52 bg-white/[0.03] border border-white/[0.09] rounded-2xl p-5 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30 transition-all leading-relaxed"
              autoFocus
            />
            <p className="text-xs text-white/15 mt-2">Optionnel — mais enrichit considérablement la génération</p>
          </div>
        )}

        {/* ── STEP 4: Le Projet ─────────────────────── */}
        {step === 4 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-violet-400/70 uppercase tracking-[0.2em] mb-4 border border-violet-500/20 rounded-full px-3 py-1.5">
                <Sparkles className="w-3 h-3" />Étape 4
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 tracking-tight">
                Nommez<br /><span className="text-violet-300">votre projet</span>
              </h1>
              <p className="text-white/35 text-base max-w-lg mx-auto">
                Un titre de travail et les paramètres de base. Tout ceci pourra être affiné après.
              </p>
            </div>

            <div className="space-y-8">
              {/* Title */}
              <div>
                <label className="block text-xs text-white/25 uppercase tracking-[0.15em] mb-3">Titre de travail</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Le Dernier Témoin, Aurore, Séquence 47..."
                  className="w-full h-12 bg-white/[0.03] border border-white/[0.09] rounded-xl px-4 text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30 transition-all text-sm"
                  autoFocus
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs text-white/25 uppercase tracking-[0.15em] mb-3">Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {FORMATS.map(f => (
                    <FormatTile key={f.id} f={f} selected={format === f.id} onSelect={() => setFormat(f.id)} />
                  ))}
                </div>
              </div>

              {/* Genre + Tone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/25 uppercase tracking-[0.15em] mb-2">Genres</label>
                  <p className="text-[11px] text-white/25 mb-3">Selection multiple possible, ex. Comédie + Romance.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map(g => (
                      <button key={g} onClick={() => toggleGenre(g)}
                        className={cn(
                          "text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium",
                          selectedGenres.includes(g)
                            ? "bg-violet-600/70 text-white border-violet-500/50"
                            : "bg-white/[0.02] text-white/35 border-white/[0.08] hover:text-white/60 hover:bg-white/[0.04]"
                        )}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/25 uppercase tracking-[0.15em] mb-2">Tons</label>
                  <p className="text-[11px] text-white/25 mb-3">Combinez plusieurs registres si le projet le demande.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TONES.map(t => (
                      <button key={t} onClick={() => toggleTone(t)}
                        className={cn(
                          "text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium",
                          selectedTones.includes(t)
                            ? "bg-indigo-600/70 text-white border-indigo-500/50"
                            : "bg-white/[0.02] text-white/35 border-white/[0.08] hover:text-white/60 hover:bg-white/[0.04]"
                        )}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills hint */}
              {(manuscriptExcerpt.trim().length > 50 || selectedMoods.length > 0) && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-600/8 border border-violet-500/20">
                  <Wand2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-violet-300 font-medium">Compétences narratives automatiques</p>
                    <p className="text-xs text-white/35 mt-1 leading-relaxed">
                      Après création, l'IA analysera votre vision{manuscriptExcerpt.trim().length > 50 ? " et votre manuscrit" : ""} pour lier automatiquement les compétences narratives les plus pertinentes à votre projet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NAV BUTTONS ───────────────────────────── */}
        <div className="flex items-center justify-between w-full mt-12">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 disabled:opacity-0 disabled:pointer-events-none transition-all">
            <ArrowLeft className="w-4 h-4" />Retour
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2.5 px-7 py-3 rounded-2xl text-sm font-semibold transition-all",
                canProceed()
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_4px_32px_rgba(139,92,246,0.5)] hover:scale-[1.02]"
                  : "bg-white/[0.05] text-white/20 cursor-not-allowed"
              )}>
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => void handleSubmit()}
              disabled={!canProceed() || submitting}
              className={cn(
                "flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-semibold transition-all",
                canProceed() && !submitting
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_4px_32px_rgba(139,92,246,0.5)] hover:scale-[1.02]"
                  : "bg-white/[0.05] text-white/20 cursor-not-allowed"
              )}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer la matrice
                </>
              )}
            </button>
          )}
        </div>

        {/* Step 2 hint */}
        {step === 2 && selectedMoods.length === 0 && (
          <p className="text-xs text-white/15 mt-4 text-center">Sélectionnez au moins une atmosphère pour continuer</p>
        )}

        {/* Summary preview on step 4 */}
        {step === 4 && (
          <div className="w-full mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-xs text-white/20 uppercase tracking-widest mb-3">Récapitulatif</p>
            <div className="space-y-2">
              <p className="text-xs text-white/40 italic">"{spark.length > 80 ? spark.slice(0, 80) + "..." : spark}"</p>
              {selectedMoods.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedMoods.map(id => {
                    const m = MOODS.find(x => x.id === id);
                    return m ? (
                      <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/25">
                        {m.emoji} {m.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {selectedGenres.map(g => (
                  <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/15 text-violet-300 border border-violet-500/20">
                    {g}
                  </span>
                ))}
                {selectedTones.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600/15 text-indigo-300 border border-indigo-500/20">
                    {t}
                  </span>
                ))}
              </div>
              {references && (
                <p className="text-xs text-white/30">Références : {references.slice(0, 60)}{references.length > 60 ? "..." : ""}</p>
              )}
              {manuscriptWordCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-violet-400/50">
                  <BookText className="w-3 h-3" />
                  {manuscriptWordCount} mots de manuscrit · compétences auto-liées
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
