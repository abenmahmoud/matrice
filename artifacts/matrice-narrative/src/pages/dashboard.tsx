import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, FolderOpen, Loader2, ArrowRight, BookOpen, Film, Tv, Layers } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FORMAT_CONFIG: Record<string, { icon: React.ElementType; color: string; border: string; bg: string; glow: string }> = {
  "Roman":       { icon: BookOpen,  color: "text-violet-300", border: "border-violet-500/25", bg: "bg-violet-600/10", glow: "rgba(139,92,246,0.08)" },
  "Cinéma":      { icon: Film,      color: "text-blue-300",   border: "border-blue-500/25",   bg: "bg-blue-600/10",   glow: "rgba(59,130,246,0.08)" },
  "Série TV":    { icon: Tv,        color: "text-emerald-300",border: "border-emerald-500/25",bg: "bg-emerald-600/10",glow: "rgba(16,185,129,0.08)" },
  "Novella":     { icon: BookOpen,  color: "text-amber-300",  border: "border-amber-500/25",  bg: "bg-amber-600/10",  glow: "rgba(245,158,11,0.08)" },
};

function formatConfig(format: string) {
  return FORMAT_CONFIG[format] ?? { icon: Layers, color: "text-primary/70", border: "border-primary/20", bg: "bg-primary/8", glow: "rgba(139,92,246,0.06)" };
}

export default function Dashboard() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-violet-600/6 blur-[120px]" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-8 py-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-2">Tableau de bord</p>
              <h1 className="text-3xl font-serif font-bold text-white/90">Vos univers</h1>
              <p className="text-sm text-white/30 mt-1">
                {isLoading ? "…" : projects?.length === 0
                  ? "Aucun projet pour le moment"
                  : `${projects?.length} projet${(projects?.length ?? 0) > 1 ? "s" : ""} en cours de création`
                }
              </p>
            </div>
            <Link href="/projects/new">
              <Button className="bg-primary/90 hover:bg-primary text-white rounded-xl flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau projet
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-8 py-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary/50" />
            </div>
          ) : projects?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-6">
                <FolderOpen className="w-8 h-8 text-primary/30" />
              </div>
              <h2 className="text-xl font-serif font-bold text-white/70 mb-3">Aucun projet</h2>
              <p className="text-sm text-white/25 mb-8 max-w-sm leading-relaxed">
                Décrivez votre idée en quelques phrases. Matrice génère les fondations de votre univers en moins d'une minute.
              </p>
              <Link href="/projects/new">
                <Button className="bg-primary/90 hover:bg-primary text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier univers
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects?.map((project, i) => {
                const cfg = formatConfig(project.targetFormat);
                const Icon = cfg.icon;
                const pct = project.progression ?? 0;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link href={`/projects/${project.id}`}>
                      <div
                        className={cn(
                          "group relative flex flex-col h-full p-6 rounded-2xl border cursor-pointer transition-all overflow-hidden",
                          "bg-white/[0.02] hover:bg-white/[0.035]",
                          cfg.border,
                          "hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
                        )}
                        style={{ boxShadow: `inset 0 0 60px -20px ${cfg.glow}` }}
                      >
                        {/* Format badge + date */}
                        <div className="flex items-center justify-between mb-5">
                          <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold", cfg.bg, cfg.border, "border", cfg.color)}>
                            <Icon className="w-3 h-3" />
                            {project.targetFormat}
                          </div>
                          <span className="text-[10px] text-white/20">
                            {format(new Date(project.updatedAt), "d MMM", { locale: fr })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-serif font-bold text-white/85 leading-tight mb-2 line-clamp-2 group-hover:text-white transition-colors">
                          {project.title}
                        </h3>

                        {/* Idea excerpt */}
                        <p className="text-xs text-white/25 leading-relaxed line-clamp-3 flex-1 mb-5">
                          {project.rawIdea}
                        </p>

                        {/* Progress */}
                        <div className="mt-auto space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/20 uppercase tracking-wider">Avancement</span>
                            <span className={cn("text-[10px] font-bold", pct > 0 ? cfg.color : "text-white/20")}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", pct > 0 ? "bg-gradient-to-r from-violet-600 to-indigo-500" : "bg-white/10")}
                              style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                        </div>

                        {/* Hover CTA */}
                        <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-white/20 group-hover:text-white/50 transition-colors">
                          Ouvrir <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* New project card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (projects?.length ?? 0) * 0.06 }}
              >
                <Link href="/projects/new">
                  <div className="group flex flex-col items-center justify-center h-full min-h-[220px] p-6 rounded-2xl border border-dashed border-white/[0.07] hover:border-primary/30 hover:bg-primary/[0.03] transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:bg-primary/10 group-hover:border-primary/25 flex items-center justify-center mb-3 transition-all">
                      <Plus className="w-5 h-5 text-white/20 group-hover:text-primary/60 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-white/20 group-hover:text-white/40 transition-colors">Nouveau projet</p>
                  </div>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
