import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Sparkles, BrainCircuit, Activity, BookOpen, Download,
  Wand2, Users, Globe2, Film, Presentation, Network, CheckCircle2
} from "lucide-react";

const PIPELINE = [
  { n: "I", label: "Fondations", color: "text-violet-300", border: "border-violet-500/30", bg: "bg-violet-600/10", modules: ["Matrice Narrative", "Noyau Émotionnel"] },
  { n: "II", label: "Structure", color: "text-blue-300", border: "border-blue-500/30", bg: "bg-blue-600/10", modules: ["Personnages", "Relations & Tensions", "Monde & Temporalité"] },
  { n: "III", label: "Analyse", color: "text-amber-300", border: "border-amber-500/30", bg: "bg-amber-600/10", modules: ["Scores H.P.S.A.", "Notes de Recherche"] },
  { n: "IV", label: "Écriture", color: "text-emerald-300", border: "border-emerald-500/30", bg: "bg-emerald-600/10", modules: ["Atelier Livre", "Atelier Scénario", "Atelier Série"] },
  { n: "V", label: "Publication", color: "text-rose-300", border: "border-rose-500/30", bg: "bg-rose-600/10", modules: ["Dossier de Pitch", "Exports"] },
];

const EXAMPLE_LOGLINE = "Dans une Algérie post-indépendance où les djinns ont signé un traité de non-ingérence avec l'État, une juriste spécialisée en droit surnaturel doit défendre un djinn accusé de meurtre — tout en sachant que la vraie coupable est sa propre mère.";

const EXAMPLE_THEMES = ["Identité & Héritage", "Justice vs Vérité", "Monde visible / Invisible", "Trauma intergénérationnel"];

const FEATURES = [
  { icon: Wand2, title: "31 modules IA", desc: "De la logline au script en passant par les relations entre personnages — tout est généré, structuré, exportable." },
  { icon: BrainCircuit, title: "Noyau Émotionnel", desc: "L'arc intérieur du protagoniste. Blessures, désirs profonds, masques, transformations." },
  { icon: Activity, title: "Scores H.P.S.A.", desc: "Humour, Pleur, Suspense, Attractivité — 7 dimensions analysées avec diagnostics précis." },
  { icon: Users, title: "Personnages vivants", desc: "Profondeur psychologique, contradictions, arcs narratifs, dialectique visuelle entre personnages." },
  { icon: Globe2, title: "Monde & Temporalité", desc: "Univers, lois invisibles, timeline, couches temporelles, géopolitique fictive." },
  { icon: Presentation, title: "Prêt pour les pros", desc: "Dossier de pitch, note d'intention, exports PDF/Fountain — prêt pour éditeurs et producteurs." },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#09090e] text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full bg-violet-600/8 blur-[140px]" />
        <div className="absolute top-[40%] -right-[15%] w-[50%] h-[60%] rounded-full bg-indigo-600/6 blur-[160px]" />
        <div className="absolute bottom-0 left-[30%] w-[40%] h-[30%] rounded-full bg-violet-600/4 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="py-5 px-8 border-b border-white/[0.05] relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-serif font-bold tracking-[0.22em] text-primary uppercase">Matrice</h1>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
                Tableau de bord
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5">
                Créer un univers
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col">

        {/* ── HERO ──────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8 tracking-wide">
              <Sparkles className="w-3 h-3" />
              Système d'exploitation créatif — Auteurs & Cinéastes
            </div>
            <h2 className="text-5xl md:text-[72px] font-serif font-black mb-6 leading-[0.95] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50">
              Transformez une idée brute en univers fictionnel.
            </h2>
            <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Le premier OS créatif conçu pour les conteurs exigeants. Matrice génère, structure et affine chaque dimension de votre œuvre — du concept à la publication.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/projects/new">
                <Button size="lg" className="h-13 px-9 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-[0_0_50px_-12px_hsl(var(--primary))]">
                  Commencer maintenant <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="h-13 px-7 text-base text-white/40 hover:text-white/70 hover:bg-white/[0.04]">
                  Voir mes projets
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── LOGLINE SHOWCASE ──────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm"
            >
              {/* Glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-600/15 blur-[60px] pointer-events-none" />

              <div className="p-8 md:p-12 relative z-10">
                {/* Label */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-[10px] font-bold text-violet-400/70 uppercase tracking-[0.2em]">
                    Matrice Narrative · Exemple généré
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[10px] text-violet-400/50">Généré par IA</span>
                  </div>
                </div>

                {/* Logline hero */}
                <blockquote className="text-xl md:text-2xl font-serif text-white/85 leading-relaxed mb-8 border-l-2 border-violet-500/50 pl-6">
                  "{EXAMPLE_LOGLINE}"
                </blockquote>

                {/* Themes */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {EXAMPLE_THEMES.map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-violet-600/12 text-violet-300/80 border border-violet-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.05]">
                  {[
                    { label: "Modules IA", value: "31" },
                    { label: "Tables de données", value: "25" },
                    { label: "Formats d'export", value: "5" },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl font-serif font-black text-white/80">{s.value}</p>
                      <p className="text-[10px] text-white/25 mt-0.5 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── PIPELINE VISUEL ───────────────────────── */}
        <section className="py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.25em] mb-3">Pipeline créatif</p>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white/85">
                De l'idée à l'œuvre publiable
              </h3>
              <p className="text-sm text-white/30 mt-3 max-w-md mx-auto">
                Cinq phases structurées, chacune alimentant la suivante. Matrice maintient la cohérence globale à chaque étape.
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-3">
              {PIPELINE.map((phase, i) => (
                <motion.div
                  key={phase.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex-1 rounded-2xl border ${phase.border} ${phase.bg} p-5`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`text-[10px] font-black ${phase.color} border ${phase.border} rounded-full w-6 h-6 flex items-center justify-center`}>
                      {phase.n}
                    </div>
                    <span className={`text-xs font-bold ${phase.color} uppercase tracking-wider`}>{phase.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    {phase.modules.map(m => (
                      <div key={m} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-3 h-3 ${phase.color} flex-shrink-0`} />
                        <span className="text-[11px] text-white/45">{m}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ─────────────────────────── */}
        <section className="py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.25em] mb-3">Capacités</p>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white/85">
                Ce que Matrice génère pour vous
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/[0.1] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <f.icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <h4 className="text-sm font-bold text-white/80 mb-2">{f.title}</h4>
                  <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ─────────────────────────────── */}
        <section className="py-24 px-6 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Film className="w-7 h-7 text-primary/60" />
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white/90 mb-4">
              Votre prochain univers commence ici.
            </h3>
            <p className="text-sm text-white/30 mb-10 leading-relaxed max-w-md mx-auto">
              Décrivez votre idée en quelques phrases. Matrice construit les fondations de votre œuvre en moins d'une minute.
            </p>
            <Link href="/projects/new">
              <Button size="lg" className="h-13 px-10 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-[0_0_50px_-12px_hsl(var(--primary))]">
                Créer un univers <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] py-8 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-xs font-serif font-bold tracking-[0.2em] text-white/20 uppercase">Matrice</span>
            <span className="text-xs text-white/15">Système d'exploitation créatif</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
