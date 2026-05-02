import { Link, useLocation, useParams, useRoute } from "wouter";
import { 
  Home, 
  LayoutDashboard, 
  Plus, 
  BookOpen, 
  Brain, 
  Users, 
  Network, 
  Globe2, 
  Search, 
  Activity, 
  Book, 
  Film, 
  Tv, 
  Presentation, 
  Download,
  Zap,
  FlaskConical,
  ScanText,
  FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetProject } from "@workspace/api-client-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [match, params] = useRoute("/projects/:id/*?");
  const projectId = match ? params?.id : null;

  const { data: project } = useGetProject(projectId as string, {
    query: {
      enabled: !!projectId && projectId !== "new",
      queryKey: [`/api/projects/${projectId}`],
    }
  });

  const rootNav = [
    { name: "Page d'accueil", href: "/", icon: Home },
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analyser un texte", href: "/analyse", icon: ScanText },
    { name: "Créer un univers", href: "/projects/new", icon: Plus },
  ];

  const projectNav = projectId && projectId !== "new" ? [
    { name: "Matrice Narrative", href: `/projects/${projectId}/matrix`, icon: BookOpen },
    { name: "Noyau Émotionnel", href: `/projects/${projectId}/emotional-core`, icon: Brain },
    { name: "Personnages", href: `/projects/${projectId}/characters`, icon: Users },
    { name: "Relations", href: `/projects/${projectId}/relationships`, icon: Network },
    { name: "Monde & Temporalité", href: `/projects/${projectId}/world`, icon: Globe2 },
    { name: "Moteur de Recherche", href: `/projects/${projectId}/research`, icon: Search },
    { name: "Scores H.P.S.A.", href: `/projects/${projectId}/hpsa`, icon: Activity },
    { name: "Atelier Livre", href: `/projects/${projectId}/book`, icon: Book },
    { name: "Atelier Scénario", href: `/projects/${projectId}/screenplay`, icon: Film },
    { name: "Atelier Série", href: `/projects/${projectId}/series`, icon: Tv },
    { name: "Atelier Pitch", href: `/projects/${projectId}/pitch`, icon: Presentation },
    { name: "Exports", href: `/projects/${projectId}/exports`, icon: Download },
    { name: "Analyse IA", href: `/projects/${projectId}/analyse`, icon: FileSearch },
  ] : [];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-sidebar/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-border/50">
          <Link href="/">
            <h1 className="text-xl font-serif font-bold text-primary cursor-pointer tracking-wide uppercase">
              MATRICE
            </h1>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {rootNav.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 cursor-pointer",
                    (location === item.href || (item.href === "/" && location === ""))
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {projectNav.length > 0 && (
            <div className="mt-8">
              <div className="px-6 mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Projet: {project?.title || "Chargement..."}
                </p>
              </div>
              <nav className="px-3 space-y-1">
                {projectNav.map((item) => {
                  const isActive = location.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 cursor-pointer",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
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
