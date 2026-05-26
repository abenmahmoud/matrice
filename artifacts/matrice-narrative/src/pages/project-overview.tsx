import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetProject } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";
import { apiFetch } from "@/lib/apiFetch";
import { getUserToken, userAuthHeaders } from "@/lib/userAuth";
import type { LentilleAnalysisRow } from "@/components/lentille/types";
import {
  BookOpen, Brain, Users, Network, Globe2, Search, Activity,
  Book, Film, Tv, Presentation, Download, FileSearch, BookMarked,
  ArrowRight, Sparkles, CheckCircle2, Circle, Loader2, Wand2, BookText, LockKeyhole
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type StatusMap = {
  matrix: boolean; emotionalCore: boolean; characters: boolean;
  relationships: boolean; world: boolean; research: boolean;
  hpsa: boolean; book: boolean; screenplay: boolean; series: boolean; pitch: boolean;
};

type ProductAccess = {
  mode: "private" | "commercial";
  plan: "private" | "free" | "pro" | "studio" | "publish" | "enterprise";
  viewer: {
    role: "owner" | "user" | "public";
    authenticated: boolean;
    source: "private-mode" | "admin-token" | "user-token" | "anonymous";
    userId?: string;
    email?: string;
  };
  isPrivate: boolean;
  isPaid: boolean;
  limits: { freeUnlockedModules: string[] };
  paywall: { title: string; message: string; cta: string };
};

// ---------------------------------------------------------------------------
// Creative Pipeline Definition
// ---------------------------------------------------------------------------
const PHASES = [
  {
    n: "I", label: "Fondations", desc: "L'architecture de votre univers",
    color: "violet" as const,
    glow: "rgba(139,92,246,0.12)",
    border: "border-violet-500/25",
    accent: "text-violet-300",
    bg: "bg-violet-600/10",
    ring: "ring-violet-500/50 shadow-[0_0_16px_rgba(139,92,246,0.25)]",
    modules: [
      { key: "matrix" as keyof StatusMap, name: "Matrice Narrative", href: "matrix", icon: BookOpen,
        desc: "Structure, logline, thèmes, règles de l'univers. Le fondement de tout." },
      { key: "emotionalCore" as keyof StatusMap, name: "Noyau Émotionnel", href: "emotional-core", icon: Brain,
        desc: "Arc émotionnel du protagoniste, blessures, désirs profonds, masques." },
    ],
  },
  {
    n: "II", label: "Structure", desc: "Les habitants et l'espace narratif",
    color: "blue" as const,
    glow: "rgba(59,130,246,0.10)",
    border: "border-blue-500/25",
    accent: "text-blue-300",
    bg: "bg-blue-600/10",
    ring: "ring-blue-500/50 shadow-[0_0_16px_rgba(59,130,246,0.25)]",
    modules: [
      { key: "characters" as keyof StatusMap, name: "Personnages", href: "characters", icon: Users,
        desc: "Personnages profonds avec arcs, contradictions et identités visuelles." },
      { key: "relationships" as keyof StatusMap, name: "Relations & Tensions", href: "relationships", icon: Network,
        desc: "Dynamiques émotionnelles, alliances, conflits entre personnages." },
      { key: "world" as keyof StatusMap, name: "Monde & Temporalité", href: "world", icon: Globe2,
        desc: "Univers, règles, lieux, timeline, couches temporelles." },
    ],
  },
  {
    n: "III", label: "Analyse", desc: "Évaluation et profondeur",
    color: "amber" as const,
    glow: "rgba(245,158,11,0.08)",
    border: "border-amber-500/25",
    accent: "text-amber-300",
    bg: "bg-amber-600/10",
    ring: "ring-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.20)]",
    modules: [
      { key: "hpsa" as keyof StatusMap, name: "Scores H.P.S.A.", href: "hpsa", icon: Activity,
        desc: "7 dimensions : Humour, Pleur, Suspense, Attractivité, Profondeur, Originalité, Cohérence." },
      { key: "research" as keyof StatusMap, name: "Notes de Recherche", href: "research", icon: Search,
        desc: "Références, risques de clichés, opportunités d'originalité." },
    ],
  },
  {
    n: "IV", label: "Écriture", desc: "Passez à la création",
    color: "emerald" as const,
    glow: "rgba(16,185,129,0.08)",
    border: "border-emerald-500/25",
    accent: "text-emerald-300",
    bg: "bg-emerald-600/10",
    ring: "ring-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.20)]",
    modules: [
      { key: "book" as keyof StatusMap, name: "Atelier Livre", href: "book", icon: Book,
        desc: "Plan détaillé, synopsis, table des matières, ébauches de chapitres." },
      { key: "screenplay" as keyof StatusMap, name: "Atelier Scénario", href: "screenplay", icon: Film,
        desc: "Traitement, découpage, scènes, script Fountain professionnel." },
      { key: "series" as keyof StatusMap, name: "Atelier Série", href: "series", icon: Tv,
        desc: "Arcs narratifs de saison, épisodes, cliffhangers, révélations progressives." },
    ],
  },
  {
    n: "V", label: "Publication", desc: "Préparez votre œuvre pour le monde",
    color: "rose" as const,
    glow: "rgba(244,63,94,0.08)",
    border: "border-rose-500/25",
    accent: "text-rose-300",
    bg: "bg-rose-600/10",
    ring: "ring-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.20)]",
    modules: [
      { key: "pitch" as keyof StatusMap, name: "Dossier de Pitch", href: "pitch", icon: Presentation,
        desc: "Document professionnel pour producteurs, éditeurs, financeurs." },
      { key: "research" as keyof StatusMap, name: "Analyse IA", href: "analyse", icon: FileSearch,
        desc: "Diagnostic narratif complet sur votre projet avec recommandations." },
    ],
    extraModules: [
      { name: "Passeport d'Œuvre", href: "passport", icon: BookMarked,
        desc: "Identite, trace de version, checklist de depot et reconnaissance." },
      { name: "Exports", href: "exports", icon: Download,
        desc: "PDF, Markdown, Fountain, JSON — tous vos documents exportables." },
    ],
  },
];

const ALL_MODULE_KEYS: (keyof StatusMap)[] = [
  "matrix", "emotionalCore", "characters", "relationships", "world",
  "research", "hpsa", "book", "screenplay", "series", "pitch",
];

function getNextStep(status: StatusMap): string | null {
  if (!status.matrix) return "matrix";
  if (!status.emotionalCore) return "emotional-core";
  if (!status.characters) return "characters";
  if (!status.relationships) return "relationships";
  if (!status.world) return "world";
  if (!status.hpsa) return "hpsa";
  if (!status.research) return "research";
  if (!status.screenplay) return "screenplay";
  if (!status.pitch) return "pitch";
  return null;
}

// ---------------------------------------------------------------------------
// Progress Arc SVG
// ---------------------------------------------------------------------------
function ProgressArc({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke="url(#arcGrad)" strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white leading-none">{pct}%</span>
        <span className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">avancement</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module Card
// ---------------------------------------------------------------------------
function ModuleCard({ name, href, icon: Icon, desc, done, projectId, phase, locked, paywallCta }: {
  name: string; href: string; icon: React.ElementType;
  desc: string; done: boolean; projectId: string;
  locked?: boolean;
  paywallCta?: string;
  phase: typeof PHASES[0];
}) {
  return (
    <Link href={locked ? `/projects/${projectId}` : `/projects/${projectId}/${href}`}>
      <div className={cn(
        "group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden",
        locked
          ? "bg-white/[0.015] border-white/[0.06] opacity-80"
          : done
            ? `${phase.bg} ${phase.border} ring-1 ${phase.ring}`
            : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.12]"
      )}>
        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
            done ? `${phase.bg} border ${phase.border}` : "bg-white/[0.05] border border-white/[0.08]"
          )}>
            <Icon className={cn("w-4.5 h-4.5", done ? phase.accent : "text-white/30")} style={{ width: 18, height: 18 }} />
          </div>
          {locked
            ? <LockKeyhole className="w-4 h-4 text-amber-300/70" />
            : done
              ? <CheckCircle2 className={cn("w-4 h-4", phase.accent)} />
              : <Circle className="w-4 h-4 text-white/15" />
          }
        </div>

        {/* Content */}
        <div>
          <p className={cn("text-sm font-bold leading-tight", done ? "text-white/90" : "text-white/55")}>{name}</p>
          <p className="text-xs text-white/25 mt-1.5 leading-relaxed">{desc}</p>
        </div>

        {/* CTA */}
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-semibold mt-auto pt-1 transition-all",
          locked ? "text-amber-300/75" : done ? phase.accent : "text-white/25 group-hover:text-white/45"
        )}>
          {locked ? (paywallCta ?? "Debloquer") : done ? "Ouvrir" : "Generer"}
          {locked ? <LockKeyhole className="w-3 h-3" /> : <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Extra (always-available) card
// ---------------------------------------------------------------------------
function ExtraCard({ name, href, icon: Icon, desc, projectId }: {
  name: string; href: string; icon: React.ElementType; desc: string; projectId: string;
}) {
  return (
    <Link href={`/projects/${projectId}/${href}`}>
      <div className="group flex flex-col gap-3 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
          <Icon className="w-4.5 text-white/30" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white/55">{name}</p>
          <p className="text-xs text-white/25 mt-1.5 leading-relaxed">{desc}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/25 group-hover:text-white/45 transition-colors mt-auto pt-1">
          Ouvrir <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ProjectOverview() {
  const { id } = useParams<{ id: string }>();
  const { adminHeaders, token } = useAdmin();

  const { data: project, isLoading: projectLoading } = useGetProject(id!, {
    query: { enabled: !!id, queryKey: [`/api/projects/${id}`] }
  });

  const { data: status, isLoading: statusLoading } = useQuery<StatusMap>({
    queryKey: [`/api/projects/${id}/status`],
    queryFn: () => apiFetch(`${BASE}/api/projects/${id}/status`).then(r => r.json()) as Promise<StatusMap>,
    enabled: !!id,
    staleTime: 10_000,
  });

  const { data: access } = useQuery<ProductAccess>({
    queryKey: ["/api/access", token ?? "anonymous", getUserToken() ?? "anonymous"],
    queryFn: () => {
      const headers = new Headers(userAuthHeaders());
      new Headers(adminHeaders()).forEach((value, key) => headers.set(key, value));
      return fetch(`${BASE}/api/access`, { headers }).then(r => r.json()) as Promise<ProductAccess>;
    },
    staleTime: 60_000,
  });

  const { data: lentilleLatest } = useQuery<{ analyse: LentilleAnalysisRow | null }>({
    queryKey: [`/api/lentille-marche/project/${id}/latest`],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/lentille-marche/project/${id}/latest`);
      return response.json() as Promise<{ analyse: LentilleAnalysisRow | null }>;
    },
    enabled: !!id && !!getUserToken(),
    staleTime: 30_000,
  });

  if (projectLoading || statusLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Projet introuvable.</div>
      </AppLayout>
    );
  }

  const safeStatus: StatusMap = status ?? {
    matrix: false, emotionalCore: false, characters: false, relationships: false,
    world: false, research: false, hpsa: false, book: false,
    screenplay: false, series: false, pitch: false,
  };

  const completedCount = ALL_MODULE_KEYS.filter(k => safeStatus[k]).length;
  const totalCount = ALL_MODULE_KEYS.length;
  const completionPct = Math.round((completedCount / totalCount) * 100);
  const nextStep = getNextStep(safeStatus);
  const isCommercialFree = access?.mode === "commercial" && !access.isPaid;
  const isOwnerViewer = access?.viewer.role === "owner";
  const unlockedModules = access?.limits.freeUnlockedModules ?? [];

  const visualMoods = (project as unknown as { visualMoods?: string[] }).visualMoods ?? [];
  const spark = project.rawIdea ?? "";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">

        {/* ── HEADER ────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/8 blur-[140px]" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-600/6 blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">

              {/* Left: project info */}
              <div className="flex-1 min-w-0">
                {/* Format/genre/tone badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 font-medium">
                    {project.targetFormat}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] text-white/45 border border-white/[0.09]">
                    {project.genre}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] text-white/45 border border-white/[0.09]">
                    {project.tone}
                  </span>
                </div>

                {/* Title */}
                <h1 className="mobile-safe-wrap mb-6 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  {project.title}
                </h1>

                {/* Visual moods */}
                {visualMoods.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {visualMoods.map((m: string) => (
                      <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-indigo-600/15 text-indigo-300/70 border border-indigo-500/20">
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Spark quote */}
                {spark && (
                  <blockquote className="border-l-2 border-violet-500/40 py-1 pl-4">
                    <p className="text-sm text-white/35 italic leading-relaxed line-clamp-3">
                      "{spark.length > 180 ? spark.slice(0, 180) + "…" : spark}"
                    </p>
                  </blockquote>
                )}
              </div>

              {/* Right: progress + next step */}
              <div className="flex w-full flex-col items-center gap-5 sm:w-auto lg:items-end">
                <ProgressArc pct={completionPct} />

                <div className="text-center lg:text-right">
                  <p className="text-xs text-white/20 uppercase tracking-widest mb-1">Modules complétés</p>
                  <p className="text-sm font-bold text-white/60">{completedCount} <span className="text-white/25 font-normal">/ {totalCount}</span></p>
                </div>

                {/* Next recommended step */}
                {nextStep && (
                  <Link href={`/projects/${id}/${nextStep}`}>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-violet-600/15 border border-violet-500/30 hover:bg-violet-600/20 transition-colors cursor-pointer group">
                      <Wand2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-violet-400/70 uppercase tracking-widest">Prochaine étape</p>
                        <p className="text-xs font-semibold text-violet-300 mt-0.5 group-hover:text-violet-200 transition-colors">
                          {PHASES.flatMap(p => p.modules).find(m => m.href === nextStep)?.name ?? nextStep}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-violet-400/60 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                )}

                {/* Manuscript hint */}
                {(project as unknown as { manuscriptExcerpt?: string }).manuscriptExcerpt && (
                  <div className="flex items-center gap-2 text-xs text-violet-400/40">
                    <BookText className="w-3 h-3" />Manuscrit inclus
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CREATIVE PIPELINE ─────────────────────── */}
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

          {/* Completion banner when all done */}
          {completedCount === totalCount && (
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-600/15 to-indigo-600/15 border border-violet-500/30">
              <div className="w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <p className="font-bold text-violet-200">Parcours créatif complet</p>
                <p className="text-sm text-white/40 mt-0.5">Tous les modules ont été générés. Votre œuvre est prête pour la publication.</p>
              </div>
            </div>
          )}

          {isCommercialFree && access && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-amber-500/[0.08] border border-amber-400/20">
              <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center flex-shrink-0">
                <LockKeyhole className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-100">{access.paywall.title}</p>
                <p className="text-sm text-white/40 mt-0.5">{access.paywall.message}</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-amber-300 text-black text-sm font-bold hover:bg-amber-200 transition-colors">
                {access.paywall.cta}
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-300/[0.10] via-white/[0.035] to-rose-400/[0.08] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                  <Sparkles className="h-4 w-4" />
                  Lentille Marché 2026
                </div>
                <h2 className="mt-2 font-serif text-2xl font-bold text-white">Audit production</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
                  Analyse ce projet sous l'angle microdrama, IA-prod, pression spatiale, personnage déplacé et hybridation.
                </p>
              </div>

              {lentilleLatest?.analyse ? (
                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-4xl font-bold text-amber-200">{lentilleLatest.analyse.scoreGlobal}</span>
                    <div className="text-xs text-white/35">
                      <p className="uppercase tracking-[0.16em]">Score global</p>
                      <p className="mt-1 text-white/55">{lentilleLatest.analyse.formatRecommendation}</p>
                    </div>
                  </div>
                  <Link href={`/lentille-marche/${lentilleLatest.analyse.id}`}>
                    <button className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-bold text-black transition hover:bg-amber-100">
                      Voir l'audit <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              ) : (
                <Link href={`/lentille-marche?project_id=${id}`}>
                  <button className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-bold text-black transition hover:bg-amber-100">
                    Lancer une analyse production <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
            </div>
          </div>

          {PHASES.map((phase) => (
            <div key={phase.n} className="min-w-0">
              {/* Phase header */}
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0",
                  `${phase.bg} ${phase.border} ${phase.accent}`
                )}>
                  {phase.n}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white/80 uppercase tracking-wider">{phase.label}</h2>
                  <p className="text-xs text-white/25 mt-0.5">{phase.desc}</p>
                </div>
                <div className="flex-1 h-px bg-white/[0.04] ml-2" />
                {/* Phase completion */}
                <span className={cn(
                  "text-xs font-medium flex-shrink-0",
                  phase.modules.every(m => safeStatus[m.key]) ? phase.accent : "text-white/20"
                )}>
                  {phase.modules.filter(m => safeStatus[m.key]).length}/{phase.modules.length}
                </span>
              </div>

              {/* Module cards */}
              <div className={cn(
                "grid gap-4",
                phase.modules.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}>
                {phase.modules.map(mod => (
                  <ModuleCard
                    key={mod.href}
                    name={mod.name}
                    href={mod.href}
                    icon={mod.icon}
                    desc={mod.desc}
                    done={safeStatus[mod.key]}
                    projectId={id!}
                    phase={phase}
                    locked={isCommercialFree && !unlockedModules.includes(mod.href)}
                    paywallCta={access?.paywall.cta}
                  />
                ))}
                {phase.extraModules?.filter((mod) => mod.href !== "passport" || isOwnerViewer).map(mod => (
                  <ExtraCard
                    key={mod.href}
                    name={mod.name}
                    href={mod.href}
                    icon={mod.icon}
                    desc={mod.desc}
                    projectId={id!}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
