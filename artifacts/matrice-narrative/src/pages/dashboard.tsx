import { Link } from "wouter";
import { useGetDashboardSummary, useListProjects, type Project } from "@workspace/api-client-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  FolderOpen,
  Loader2,
  ArrowRight,
  BookOpen,
  Film,
  Tv,
  Layers,
  Activity,
  Gauge,
  Library,
  Sparkles,
  Target,
  Clock3,
  FileText,
  BrainCircuit,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FORMAT_CONFIG: Record<string, { icon: React.ElementType; color: string; border: string; bg: string; glow: string }> = {
  Roman: { icon: BookOpen, color: "text-violet-300", border: "border-violet-500/25", bg: "bg-violet-600/10", glow: "rgba(139,92,246,0.08)" },
  "Cinéma": { icon: Film, color: "text-blue-300", border: "border-blue-500/25", bg: "bg-blue-600/10", glow: "rgba(59,130,246,0.08)" },
  "Série TV": { icon: Tv, color: "text-emerald-300", border: "border-emerald-500/25", bg: "bg-emerald-600/10", glow: "rgba(16,185,129,0.08)" },
  Novella: { icon: BookOpen, color: "text-amber-300", border: "border-amber-500/25", bg: "bg-amber-600/10", glow: "rgba(245,158,11,0.08)" },
};

function formatConfig(formatName: string) {
  return FORMAT_CONFIG[formatName] ?? { icon: Layers, color: "text-primary/70", border: "border-primary/20", bg: "bg-primary/8", glow: "rgba(139,92,246,0.06)" };
}

function clampProgress(value: number | undefined) {
  return Math.min(100, Math.max(0, Math.round(value ?? 0)));
}

function getNextGesture(project?: Project) {
  if (!project) {
    return {
      label: "Créer une première vision",
      detail: "Déposer une idée brute pour ouvrir l'atelier.",
      href: "/projects/new",
      icon: Plus,
    };
  }

  const pct = clampProgress(project.progression);
  if (pct < 20) {
    return {
      label: "Forger la matrice",
      detail: "Transformer l'idée brute en ADN narratif.",
      href: `/projects/${project.id}/matrix`,
      icon: BrainCircuit,
    };
  }
  if (pct < 45) {
    return {
      label: "Creuser le noyau émotionnel",
      detail: "Clarifier blessure, désir et transformation.",
      href: `/projects/${project.id}/emotional-core`,
      icon: Activity,
    };
  }
  if (pct < 70) {
    return {
      label: "Structurer l'oeuvre",
      detail: "Passer des fondations aux scènes, chapitres ou épisodes.",
      href: `/projects/${project.id}/screenplay`,
      icon: FileText,
    };
  }
  return {
    label: "Préparer le dossier",
    detail: "Consolider pitch, note d'intention et exports.",
    href: `/projects/${project.id}/pitch`,
    icon: Target,
  };
}

function getProjectAge(project?: Project) {
  if (!project?.updatedAt) return "Aucune activité";
  return `Mis à jour il y a ${formatDistanceToNowStrict(new Date(project.updatedAt), { locale: fr })}`;
}

function StatTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = "violet",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tone?: "violet" | "blue" | "emerald" | "amber";
}) {
  const tones = {
    violet: "border-violet-500/20 bg-violet-600/[0.06] text-violet-300",
    blue: "border-blue-500/20 bg-blue-600/[0.06] text-blue-300",
    emerald: "border-emerald-500/20 bg-emerald-600/[0.06] text-emerald-300",
    amber: "border-amber-500/20 bg-amber-600/[0.06] text-amber-300",
  };

  return (
    <div className={cn("rounded-xl border p-4", tones[tone])}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">{label}</p>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <p className="mt-4 text-2xl font-serif font-black text-white/85">{value}</p>
      <p className="mt-1 text-xs text-white/30 leading-relaxed">{detail}</p>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cfg = formatConfig(project.targetFormat);
  const Icon = cfg.icon;
  const pct = clampProgress(project.progression);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/projects/${project.id}`}>
        <div
          className={cn(
            "group relative flex h-full min-h-[236px] cursor-pointer flex-col overflow-hidden rounded-xl border p-5 transition-all",
            "bg-white/[0.018] hover:bg-white/[0.035]",
            cfg.border,
          )}
          style={{ boxShadow: `inset 0 0 60px -22px ${cfg.glow}` }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className={cn("flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold", cfg.bg, cfg.border, cfg.color)}>
              <Icon className="w-3 h-3" />
              {project.targetFormat}
            </div>
            <span className="text-[10px] text-white/20">{format(new Date(project.updatedAt), "d MMM", { locale: fr })}</span>
          </div>

          <h3 className="mt-5 line-clamp-2 text-lg font-bold font-serif leading-tight text-white/85 transition-colors group-hover:text-white">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-white/28">{project.rawIdea}</p>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/20">Avancement</span>
              <span className={cn("text-[10px] font-bold", pct > 0 ? cfg.color : "text-white/20")}>{pct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700"
                style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/22 transition-colors group-hover:text-white/55">
            Ouvrir <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: projects = [], isLoading } = useListProjects();
  const { data: summary } = useGetDashboardSummary();
  const focusProject = projects[0];
  const nextGesture = getNextGesture(focusProject);
  const NextIcon = nextGesture.icon;
  const averageProgress = clampProgress(summary?.averageProgression);
  const topGenre = summary?.byGenre?.[0]?.genre ?? projects[0]?.genre ?? "Non défini";
  const topFormat = summary?.byFormat?.[0]?.format ?? projects[0]?.targetFormat ?? "Non défini";
  const activeProjects = projects.filter((project) => clampProgress(project.progression) < 100).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">
        <div className="border-b border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-8 py-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-2">Cockpit privé</p>
              <h1 className="text-3xl font-serif font-bold text-white/90">Matrice personnelle</h1>
              <p className="text-sm text-white/30 mt-1">
                {isLoading ? "Chargement de l'atelier..." : `${projects.length} projet${projects.length > 1 ? "s" : ""} dans ton espace créatif`}
              </p>
            </div>
            <Link href="/projects/new">
              <Button className="bg-primary/90 hover:bg-primary text-white rounded-xl flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle vision
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary/50" />
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-6">
                <FolderOpen className="w-8 h-8 text-primary/30" />
              </div>
              <h2 className="text-xl font-serif font-bold text-white/70 mb-3">Aucune vision déposée</h2>
              <p className="text-sm text-white/25 mb-8 max-w-sm leading-relaxed">
                Commence par une idée brute, une image, une scène ou une obsession. Matrice construira le premier socle.
              </p>
              <Link href="/projects/new">
                <Button className="bg-primary/90 hover:bg-primary text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier univers
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-5">
                <section className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Focus du moment</p>
                      <h2 className="mt-3 text-2xl font-serif font-bold text-white/90">{focusProject.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/35 line-clamp-3">{focusProject.rawIdea}</p>
                      <p className="mt-4 text-xs text-white/22">{getProjectAge(focusProject)}</p>
                    </div>
                    <div className="hidden md:flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.06]">
                      <Gauge className="w-10 h-10 text-primary/50" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/[0.05] bg-black/10 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
                          <NextIcon className="w-4 h-4 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/75">{nextGesture.label}</p>
                          <p className="text-xs text-white/30 mt-1">{nextGesture.detail}</p>
                        </div>
                      </div>
                      <Link href={nextGesture.href}>
                        <Button size="sm" className="rounded-lg bg-primary/90 text-white hover:bg-primary">
                          Continuer <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <StatTile icon={Library} label="Projets" value={`${summary?.totalProjects ?? projects.length}`} detail={`${activeProjects} actif${activeProjects > 1 ? "s" : ""}`} />
                  <StatTile icon={Activity} label="Moyenne" value={`${averageProgress}%`} detail="Progression globale" tone="blue" />
                  <StatTile icon={Sparkles} label="Genre" value={topGenre} detail="Territoire dominant" tone="emerald" />
                  <StatTile icon={Layers} label="Format" value={topFormat} detail="Forme dominante" tone="amber" />
                </section>
              </div>

              <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Bibliothèque active</p>
                      <h2 className="text-xl font-serif font-bold text-white/80 mt-1">Univers en cours</h2>
                    </div>
                    <Link href="/projects/new">
                      <Button variant="outline" size="sm" className="border-white/[0.08] bg-white/[0.02] text-white/45 hover:bg-white/[0.05] hover:text-white/75">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Ajouter
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock3 className="w-4 h-4 text-white/35" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">Activité récente</p>
                    </div>
                    <div className="space-y-3">
                      {(summary?.recentProjects ?? projects.slice(0, 5)).slice(0, 5).map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <div className="group rounded-lg border border-white/[0.045] bg-white/[0.015] p-3 hover:bg-white/[0.035] transition-colors cursor-pointer">
                            <p className="text-sm font-medium text-white/65 group-hover:text-white/85 line-clamp-1">{project.title}</p>
                            <p className="mt-1 text-[11px] text-white/24">{getProjectAge(project)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-500/15 bg-violet-600/[0.04] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/45">Mémoire privée</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/38">
                      Prochain bloc durable: ajouter une couche personnelle pour tes règles, références, motifs et critères de qualité.
                    </p>
                  </div>
                </aside>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
