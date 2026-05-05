import { Link, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Home, LayoutDashboard, Plus, BookOpen, Brain, Users, Network, Globe2,
  Search, Activity, Book, Film, Tv, Presentation, Download, ScanText,
  FileSearch, LayoutGrid, CheckCircle2, Circle, TrendingUp, Palette, Sparkles, MessageCircle,
  Printer, Clock, Telescope, BarChart2, Clapperboard, ScrollText, Wand2, Aperture, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetProject } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type StatusMap = {
  matrix: boolean; emotionalCore: boolean; characters: boolean;
  relationships: boolean; world: boolean; research: boolean;
  hpsa: boolean; book: boolean; screenplay: boolean; series: boolean; pitch: boolean;
};

const PHASES = [
  {
    label: "1 · Comprendre",
    items: [
      { name: "Matrice Narrative", href: "matrix", icon: BookOpen, key: "matrix" as keyof StatusMap },
      { name: "Noyau Émotionnel", href: "emotional-core", icon: Brain, key: "emotionalCore" as keyof StatusMap },
      { name: "Notes de Recherche", href: "research", icon: Search, key: "research" as keyof StatusMap },
    ],
  },
  {
    label: "2 · Construire",
    items: [
      { name: "Personnages", href: "characters", icon: Users, key: "characters" as keyof StatusMap },
      { name: "Relations", href: "relationships", icon: Network, key: "relationships" as keyof StatusMap },
      { name: "Monde & Temps", href: "world", icon: Globe2, key: "world" as keyof StatusMap },
    ],
  },
  {
    label: "3 · Écrire",
    items: [
      { name: "Atelier Livre", href: "book", icon: Book, key: "book" as keyof StatusMap },
      { name: "Atelier Scénario", href: "screenplay", icon: Film, key: "screenplay" as keyof StatusMap },
      { name: "Atelier Série", href: "series", icon: Tv, key: "series" as keyof StatusMap },
    ],
  },
  {
    label: "4 · Corriger",
    items: [
      { name: "Scores H.P.S.A.", href: "hpsa", icon: Activity, key: "hpsa" as keyof StatusMap },
    ],
    extra: [
      { name: "Les 5 Piliers", href: "piliers", icon: BarChart2 },
      { name: "Analyse IA", href: "analyse", icon: FileSearch },
    ],
  },
  {
    label: "5 · Présenter",
    items: [
      { name: "Dossier de Pitch", href: "pitch", icon: Presentation, key: "pitch" as keyof StatusMap },
    ],
    extra: [
      { name: "Note d'Intention", href: "note-intention", icon: ScrollText },
      { name: "Exports", href: "exports", icon: Download },
    ],
  },
  {
    label: "Studio",
    items: [],
    extra: [
      { name: "Arc de Tension", href: "tension-arc", icon: TrendingUp },
      { name: "Atmosphères", href: "atmosphere", icon: Palette },
      { name: "Constellation", href: "constellation", icon: Sparkles },
      { name: "Parler aux persos", href: "dialogue", icon: MessageCircle },
      { name: "Mode Réalisateur", href: "director", icon: Film },
      { name: "Carnet de Tournage", href: "notebook", icon: Printer },
      { name: "Écho du Temps", href: "echo-temps", icon: Clock },
      { name: "Miroir Artistique", href: "miroir", icon: Telescope },
      { name: "Séquencier", href: "sequencier", icon: Clapperboard },
      { name: "Scènes Jouables", href: "film-scenes", icon: Wand2 },
      { name: "Prisme Universel", href: "prisme", icon: Aperture },
    ],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [match, params] = useRoute("/projects/:id/*?");
  const projectId = match ? params?.id : null;

  const { data: project } = useGetProject(projectId as string, {
    query: { enabled: !!projectId && projectId !== "new", queryKey: [`/api/projects/${projectId}`] }
  });

  const { data: status } = useQuery<StatusMap>({
    queryKey: [`/api/projects/${projectId}/status`],
    queryFn: () => fetch(`${BASE}/api/projects/${projectId}/status`).then(r => r.json()) as Promise<StatusMap>,
    enabled: !!projectId && projectId !== "new",
    staleTime: 15_000,
  });

  const rootNav = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Memoire privee", href: "/memory", icon: BrainCircuit },
    { name: "Analyser un texte", href: "/analyse", icon: ScanText },
    { name: "Nouvelle vision", href: "/projects/new", icon: Plus },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-border/40 bg-[#09090e]/80 backdrop-blur-xl flex flex-col h-screen sticky top-0 overflow-hidden">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-border/30 flex-shrink-0">
          <Link href="/">
            <h1 className="text-base font-serif font-bold text-primary cursor-pointer tracking-[0.18em] uppercase">
              MATRICE
            </h1>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-3 scrollbar-none">

          {/* Global nav */}
          <nav className="px-2 space-y-0.5">
            {rootNav.map((item) => {
              const active = location === item.href || (item.href === "/" && location === "");
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                  )}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Project nav */}
          {projectId && projectId !== "new" && (
            <div className="mt-5">
              {/* Project title */}
              <div className="px-5 mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] truncate">
                  {project?.title ?? "Projet…"}
                </p>
              </div>

              {/* Overview link */}
              <div className="px-2 mb-1">
                <Link href={`/projects/${projectId}`}>
                  <div className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                    location === `/projects/${projectId}`
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                  )}>
                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                    <span>Vue d'ensemble</span>
                  </div>
                </Link>
              </div>

              {/* Pipeline phases */}
              <div className="space-y-4 mt-4 px-2">
                {PHASES.map((phase) => (
                  <div key={phase.label}>
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.18em] font-semibold px-3 mb-1">
                      {phase.label}
                    </p>
                    <div className="space-y-0.5">
                      {phase.items.map((item) => {
                        const done = status ? status[item.key] : false;
                        const href = `/projects/${projectId}/${item.href}`;
                        const active = isActive(href);
                        return (
                          <Link key={item.href} href={href}>
                            <div className={cn(
                              "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                            )}>
                              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.name}</span>
                              {done
                                ? <CheckCircle2 className="w-3 h-3 text-primary/60 flex-shrink-0" />
                                : <Circle className="w-3 h-3 text-muted-foreground/20 flex-shrink-0" />
                              }
                            </div>
                          </Link>
                        );
                      })}
                      {phase.extra?.map((item) => {
                        const href = `/projects/${projectId}/${item.href}`;
                        const active = isActive(href);
                        return (
                          <Link key={item.href} href={href}>
                            <div className={cn(
                              "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                            )}>
                              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer progression */}
        {projectId && projectId !== "new" && status && (
          <div className="flex-shrink-0 border-t border-border/30 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Progression</span>
              <span className="text-[10px] font-bold text-primary/70">
                {Object.values(status).filter(Boolean).length}/{Object.values(status).length}
              </span>
            </div>
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.round((Object.values(status).filter(Boolean).length / Object.values(status).length) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
