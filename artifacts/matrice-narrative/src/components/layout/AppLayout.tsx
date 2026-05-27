import { Link, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Home, LayoutDashboard, Plus, BookOpen, Brain, Users, Network, Globe2,
  Search, Activity, Book, Film, Tv, Presentation, Download, ScanText,
  FileSearch, LayoutGrid, CheckCircle2, Circle, TrendingUp, Palette, Sparkles, MessageCircle,
  Printer, Clock, Telescope, BarChart2, Clapperboard, ScrollText, Wand2, Aperture, BrainCircuit, BookMarked, ShieldCheck, FileSignature,
  CircleUserRound, ChevronDown, LogOut, UserRound, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetProject } from "@workspace/api-client-react";
import { apiFetch } from "@/lib/apiFetch";
import { clearUserToken, getUserToken } from "@/lib/userAuth";
import { MobileNav, type MobileNavSection } from "@/components/layout/MobileNav";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type StatusMap = {
  matrix: boolean; emotionalCore: boolean; characters: boolean;
  relationships: boolean; world: boolean; research: boolean;
  hpsa: boolean; book: boolean; screenplay: boolean; series: boolean; pitch: boolean;
};

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  plan: string;
  isEmailVerified: boolean;
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
      { name: "Passeport d'Œuvre", href: "passport", icon: BookMarked },
      { name: "Mandat editorial", href: "mandate", icon: FileSignature },
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
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/projects/:id/*?");
  const projectId = match ? params?.id : null;
  const token = getUserToken();

  const { data: project } = useGetProject(projectId as string, {
    query: { enabled: !!projectId && projectId !== "new", queryKey: [`/api/projects/${projectId}`] }
  });

  const { data: status } = useQuery<StatusMap>({
    queryKey: [`/api/projects/${projectId}/status`],
    queryFn: () => apiFetch(`${BASE}/api/projects/${projectId}/status`).then(r => r.json()) as Promise<StatusMap>,
    enabled: !!projectId && projectId !== "new",
    staleTime: 15_000,
  });

  const { data: authUser } = useQuery<AuthUser | null>({
    queryKey: ["auth-me", token ?? "anonymous"],
    queryFn: async () => {
      if (!token) return null;
      const response = await apiFetch(`${BASE}/api/auth/me`);
      if (!response.ok) return null;
      const payload = (await response.json()) as { user: AuthUser };
      return payload.user;
    },
    enabled: !!token,
    staleTime: 30_000,
  });

  async function logout() {
    await fetch(`${BASE}/api/auth/logout`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    }).catch(() => undefined);
    clearUserToken();
    setLocation("/login");
  }

  const rootNav = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Œuvres verrouillées", href: "/locked-works", icon: ShieldCheck },
    { name: "Memoire Studio", href: "/memory", icon: BrainCircuit },
    { name: "Modules experimentaux", href: "/experimental-modules", icon: Sparkles },
    { name: "Lentille Marché 2026", href: "/lentille-marche", icon: Sparkles },
    { name: "Analyser un texte", href: "/analyse", icon: ScanText },
    { name: "Nouvelle vision", href: "/projects/new", icon: Plus },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");
  const mobileSections: MobileNavSection[] = [
    {
      label: "Navigation",
      links: rootNav.map((item) => ({
        ...item,
        active: item.href === "/" ? location === "/" || location === "" : isActive(item.href),
      })),
    },
  ];

  if (projectId && projectId !== "new") {
    mobileSections.push({
      label: project?.title ?? "Projet",
      links: [
        {
          name: "Vue d'ensemble",
          href: `/projects/${projectId}`,
          icon: LayoutGrid,
          active: location === `/projects/${projectId}` || location === `/projects/${projectId}/overview`,
        },
        ...PHASES.flatMap((phase) => [
          ...phase.items.map((item) => ({
            name: item.name,
            href: `/projects/${projectId}/${item.href}`,
            icon: item.icon,
            active: isActive(`/projects/${projectId}/${item.href}`),
            done: status ? status[item.key] : false,
          })),
          ...(phase.extra?.map((item) => ({
            name: item.name,
            href: `/projects/${projectId}/${item.href}`,
            icon: item.icon,
            active: isActive(`/projects/${projectId}/${item.href}`),
          })) ?? []),
        ]),
      ],
    });
  }

  return (
    <div className="matrice-work flex min-h-screen bg-matrice-ivoire text-matrice-encre">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col overflow-hidden border-r border-matrice-sable bg-white/85 shadow-[8px_0_32px_-28px_rgba(42,37,32,0.45)] backdrop-blur-xl lg:flex">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-matrice-sable flex-shrink-0">
          <Link href="/">
            <h1 className="text-base font-serif font-bold text-matrice-or-fonce cursor-pointer tracking-[0.18em] uppercase">
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
                      ? "bg-matrice-terracotta/12 text-matrice-terracotta font-medium"
                      : "text-matrice-encre/62 hover:bg-matrice-sable/45 hover:text-matrice-encre"
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
                <p className="text-[10px] font-semibold text-matrice-encre/50 uppercase tracking-[0.15em] truncate">
                  {project?.title ?? "Projet…"}
                </p>
              </div>

              {/* Overview link */}
              <div className="px-2 mb-1">
                <Link href={`/projects/${projectId}`}>
                  <div className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                    location === `/projects/${projectId}`
                      ? "bg-matrice-terracotta/12 text-matrice-terracotta font-medium"
                      : "text-matrice-encre/62 hover:bg-matrice-sable/45 hover:text-matrice-encre"
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
                    <p className="text-[9px] text-matrice-encre/38 uppercase tracking-[0.18em] font-semibold px-3 mb-1">
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
                                ? "bg-matrice-terracotta/12 text-matrice-terracotta font-medium"
                                : "text-matrice-encre/58 hover:bg-matrice-sable/45 hover:text-matrice-encre"
                            )}>
                              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.name}</span>
                              {done
                                ? <CheckCircle2 className="w-3 h-3 text-matrice-success/75 flex-shrink-0" />
                                : <Circle className="w-3 h-3 text-matrice-encre/20 flex-shrink-0" />
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
                                ? "bg-matrice-terracotta/12 text-matrice-terracotta font-medium"
                                : "text-matrice-encre/58 hover:bg-matrice-sable/45 hover:text-matrice-encre"
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
          <div className="flex-shrink-0 border-t border-matrice-sable px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-matrice-encre/45 uppercase tracking-wider">Progression</span>
              <span className="text-[10px] font-bold text-matrice-terracotta">
                {Object.values(status).filter(Boolean).length}/{Object.values(status).length}
              </span>
            </div>
            <div className="h-1 bg-matrice-sable rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-matrice-terracotta to-matrice-or-fonce rounded-full transition-all duration-700"
                style={{ width: `${Math.round((Object.values(status).filter(Boolean).length / Object.values(status).length) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-[140] flex min-h-[64px] items-center justify-between gap-3 border-b border-matrice-sable bg-matrice-ivoire/95 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <MobileNav
              sections={mobileSections}
              user={authUser ? { displayName: authUser.displayName, email: authUser.email } : null}
              onLogout={() => void logout()}
            />
            <Link href="/dashboard" className="inline-flex min-h-[44px] items-center truncate font-serif text-base font-bold uppercase tracking-[0.16em] text-matrice-or-fonce">
              Matrice
            </Link>
          </div>
          {authUser ? (
            <details className="relative">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 rounded-xl border border-matrice-sable bg-white px-3 py-2 text-sm text-matrice-encre/70 transition hover:bg-matrice-sable/35 hover:text-matrice-encre">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-matrice-terracotta/15 text-matrice-terracotta">
                  {(authUser.displayName || authUser.email).slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[170px] truncate sm:block">{authUser.displayName || authUser.email}</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-matrice-sable bg-white p-1 shadow-2xl shadow-black/10">
                <MenuLink href="/profile" icon={UserRound} label="Mon profil" />
                <MenuLink href="/locked-works" icon={ShieldCheck} label="Mes oeuvres" />
                <MenuLink href="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
                {(authUser.role === "admin" || authUser.role === "owner") && <MenuLink href="/admin" icon={CircleUserRound} label="Admin" />}
                <div className="my-1 h-px bg-matrice-sable" />
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-matrice-encre/62 transition hover:bg-matrice-sable/40 hover:text-matrice-encre"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </details>
          ) : (
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="flex min-h-[44px] items-center whitespace-nowrap text-sm text-matrice-encre/62 transition hover:text-matrice-terracotta">
                Se connecter
              </Link>
              <Link href="/signup" className="flex min-h-[44px] items-center whitespace-nowrap rounded-lg bg-matrice-terracotta px-3 text-sm font-medium text-white transition hover:bg-matrice-terracotta/90 sm:px-4">
                Créer un compte
              </Link>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function MenuLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href}>
      <div className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-matrice-encre/62 transition hover:bg-matrice-sable/40 hover:text-matrice-encre">
        <Icon className="h-4 w-4" />
        {label}
      </div>
    </Link>
  );
}
