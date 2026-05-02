import { useState, useEffect } from "react";
import {
  ScanText, BarChart2, Trophy, Flame, Trash2, ArrowRight,
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  FileText, Target, Users, Globe2, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AnalysisAdmin = {
  id: string; title: string; projectId?: string | null;
  globalScore: number; structureScore: number; emotionScore: number;
  archetypeScore: number; originalityScore: number; coherenceScore: number;
  verdict: string; wordCount: number; contentExcerpt: string; createdAt: string;
};
type ProjectSimple = { id: string; title: string; genre: string; tone: string };

// ---------------------------------------------------------------------------
// Color palette for projects
// ---------------------------------------------------------------------------
const PROJECT_COLORS = [
  "#a78bfa", "#60a5fa", "#f472b6", "#fbbf24",
  "#4ade80", "#fb923c", "#e879f9", "#38bdf8",
];

// ---------------------------------------------------------------------------
// Mini sparkline SVG
// ---------------------------------------------------------------------------
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) {
    return <span className="text-xs font-bold" style={{ color }}>{values[0] ?? "—"}</span>;
  }
  const W = 56; const H = 22;
  const mn = Math.min(...values); const mx = Math.max(...values);
  const range = mx - mn || 1;
  const xOf = (i: number) => (i / (values.length - 1)) * W;
  const yOf = (v: number) => H - 2 - ((v - mn) / range) * (H - 4);
  let d = `M ${xOf(0)} ${yOf(values[0])}`;
  for (let i = 1; i < values.length; i++) {
    const mx2 = (xOf(i - 1) + xOf(i)) / 2;
    d += ` C ${mx2} ${yOf(values[i - 1])} ${mx2} ${yOf(values[i])} ${xOf(i)} ${yOf(values[i])}`;
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <circle cx={xOf(values.length - 1)} cy={yOf(values[values.length - 1])} r="2.5" fill={color} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Global timeline chart (all projects, time-based X)
// ---------------------------------------------------------------------------
function GlobalChart({ analyses, projectMap, colorOf, onHover }: {
  analyses: AnalysisAdmin[];
  projectMap: Map<string, ProjectSimple>;
  colorOf: (pid: string | null | undefined) => string;
  onHover: (a: AnalysisAdmin | null) => void;
}) {
  const sorted = [...analyses].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const [hovered, setHovered] = useState<AnalysisAdmin | null>(null);

  const W = 760; const H = 200;
  const PAD = { l: 38, r: 20, t: 16, b: 34 };
  const cW = W - PAD.l - PAD.r; const cH = H - PAD.t - PAD.b;

  const allTimes = sorted.map(a => new Date(a.createdAt).getTime());
  const minT = allTimes.length ? Math.min(...allTimes) : 0;
  const maxT = allTimes.length ? Math.max(...allTimes) : 1;
  const tRange = maxT - minT || 1;

  const xOf = (date: string) => PAD.l + ((new Date(date).getTime() - minT) / tRange) * cW;
  const yOf = (v: number) => PAD.t + cH - (Math.max(0, Math.min(100, v)) / 100) * cH;

  // Group by project for lines
  const byProject = new Map<string, AnalysisAdmin[]>();
  for (const a of sorted) {
    const k = a.projectId ?? "_standalone";
    byProject.set(k, [...(byProject.get(k) ?? []), a]);
  }

  // X axis ticks (monthly or weekly)
  const tickDates: Date[] = [];
  if (sorted.length >= 2) {
    const start = new Date(minT); const end = new Date(maxT);
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) { tickDates.push(new Date(cur)); cur.setMonth(cur.getMonth() + 1); }
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={PAD.l} y1={yOf(v)} x2={W - PAD.r} y2={yOf(v)}
              stroke={v === 50 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)"} strokeWidth="1" />
            <text x={PAD.l - 6} y={yOf(v) + 4} fill="rgba(255,255,255,0.2)" fontSize="10" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* Month ticks */}
        {tickDates.map((d, i) => {
          const x = xOf(d.toISOString());
          return (
            <g key={i}>
              <line x1={x} y1={PAD.t} x2={x} y2={PAD.t + cH} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={x} y={H - 6} fill="rgba(255,255,255,0.18)" fontSize="9" textAnchor="middle">
                {d.toLocaleDateString("fr-FR", { month: "short" })}
              </text>
            </g>
          );
        })}

        {/* Lines per project */}
        {Array.from(byProject.entries()).map(([pid, pas]) => {
          if (pas.length < 2) return null;
          const color = colorOf(pid === "_standalone" ? null : pid);
          let d = `M ${xOf(pas[0].createdAt)} ${yOf(pas[0].globalScore)}`;
          for (let i = 1; i < pas.length; i++) {
            d += ` L ${xOf(pas[i].createdAt)} ${yOf(pas[i].globalScore)}`;
          }
          return <path key={pid} d={d} fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" strokeDasharray="4 2" />;
        })}

        {/* Dots — all analyses */}
        {sorted.map((a, i) => {
          const color = colorOf(a.projectId);
          const r = a.coherenceScore > 0 ? 4 + (a.coherenceScore / 100) * 3 : 4;
          const isH = hovered?.id === a.id;
          return (
            <circle key={i}
              cx={xOf(a.createdAt)} cy={yOf(a.globalScore)} r={isH ? r + 2 : r}
              fill={color} stroke={isH ? "white" : "rgba(15,15,25,0.8)"} strokeWidth={isH ? 1.5 : 1.5}
              style={{ cursor: "pointer", transition: "r 0.1s" }}
              onMouseEnter={() => { setHovered(a); onHover(a); }}
              onMouseLeave={() => { setHovered(null); onHover(null); }} />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-2 right-2 rounded-xl border border-white/10 bg-black/80 backdrop-blur-sm p-3 pointer-events-none min-w-[200px] z-10">
          <p className="text-[10px] text-white/30 mb-1">
            {hovered.projectId ? (projectMap.get(hovered.projectId)?.title ?? hovered.projectId) : "Sans projet"}
          </p>
          <p className="text-xs font-semibold text-white mb-2 truncate max-w-[180px]">{hovered.title}</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              ["Global", hovered.globalScore, "#a78bfa"],
              ["Structure", hovered.structureScore, "#60a5fa"],
              ["Émotion", hovered.emotionScore, "#f472b6"],
              ["Cohérence", hovered.coherenceScore, "#4ade80"],
            ].map(([l, v, c]) => v !== 0 && (
              <div key={l as string} className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-white/35">{l as string}</span>
                <span className="text-xs font-bold" style={{ color: c as string }}>{v as number}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/20 mt-2 border-t border-white/[0.06] pt-1.5">
            {new Date(hovered.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · {hovered.wordCount.toLocaleString("fr-FR")} mots
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-project row
// ---------------------------------------------------------------------------
function ProjectRow({ pid, analyses, project, color }: {
  pid: string; analyses: AnalysisAdmin[]; project?: ProjectSimple; color: string;
}) {
  const sorted = [...analyses].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const first = sorted[0]; const last = sorted[sorted.length - 1];
  const delta = sorted.length >= 2 ? last.globalScore - first.globalScore : null;
  const best = Math.max(...sorted.map(a => a.globalScore));
  const values = sorted.map(a => a.globalScore);
  const lastDate = new Date(last.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const avgCoh = sorted.filter(a => a.coherenceScore > 0);
  const cohAvg = avgCoh.length ? Math.round(avgCoh.reduce((s, a) => s + a.coherenceScore, 0) / avgCoh.length) : null;

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] transition-all">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white/80 truncate">{project?.title ?? "Sans projet"}</p>
          {project && <span className="text-[10px] text-white/20 border border-white/[0.08] rounded px-1.5 py-0.5">{project.genre}</span>}
        </div>
        <p className="text-xs text-white/25 mt-0.5">{sorted.length} analyse{sorted.length > 1 ? "s" : ""} · dernière le {lastDate}</p>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-center hidden md:block">
          <p className="text-[10px] text-white/20 mb-0.5">Premier</p>
          <p className="text-sm font-bold text-white/50">{first.globalScore}</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-[10px] text-white/20 mb-0.5">Dernier</p>
          <p className="text-sm font-bold" style={{ color }}>{last.globalScore}</p>
        </div>
        {delta !== null && (
          <div className="text-center hidden md:block">
            <p className="text-[10px] text-white/20 mb-0.5">Delta</p>
            <p className={cn("text-sm font-bold flex items-center gap-0.5",
              delta > 0 ? "text-green-300" : delta < 0 ? "text-red-300" : "text-white/30")}>
              {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : delta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {Math.abs(delta)}
            </p>
          </div>
        )}
        <div className="text-center hidden lg:block">
          <p className="text-[10px] text-white/20 mb-0.5">Meilleur</p>
          <p className="text-sm font-bold text-amber-300">{best}</p>
        </div>
        {cohAvg !== null && (
          <div className="text-center hidden lg:block">
            <p className="text-[10px] text-white/20 mb-0.5">Coh. moy.</p>
            <p className="text-sm font-bold text-green-300">{cohAvg}</p>
          </div>
        )}
        <div className="hidden md:flex items-center">
          <Sparkline values={values} color={color} />
        </div>
        {pid !== "_standalone" && (
          <a href={`${import.meta.env.BASE_URL}projects/${pid}/analyse`}
            className="p-1.5 text-white/15 hover:text-violet-300 transition-colors rounded-lg hover:bg-violet-500/10"
            title="Ouvrir l'analyse du projet">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analysis row (full list)
// ---------------------------------------------------------------------------
function AnalysisRow({ a, project, color, onDelete }: {
  a: AnalysisAdmin; project?: ProjectSimple; color: string; onDelete: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const date = new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" });
  const scoreColor = a.globalScore >= 75 ? "text-violet-300 bg-violet-500/15 border-violet-500/25"
    : a.globalScore >= 55 ? "text-indigo-300 bg-indigo-500/15 border-indigo-500/25"
    : a.globalScore >= 35 ? "text-amber-300 bg-amber-500/15 border-amber-500/25"
    : "text-red-300 bg-red-500/15 border-red-500/25";

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.05] hover:bg-white/[0.02] transition-all group">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {project && (
            <span className="text-[10px] text-white/30 border border-white/[0.08] rounded px-1.5 py-0.5 flex-shrink-0">{project.title}</span>
          )}
          <span className="text-xs font-medium text-white/65 truncate">{a.title}</span>
        </div>
        <p className="text-[10px] text-white/20 italic truncate">"{a.verdict}"</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-white/20">{date}</span>
        <span className="text-[10px] text-white/15">{a.wordCount.toLocaleString("fr-FR")}m</span>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg border", scoreColor)}>{a.globalScore}</span>
        {a.coherenceScore > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg border text-green-300/80 bg-green-500/10 border-green-500/20 text-[10px]">
            ≈{a.coherenceScore}
          </span>
        )}
        {confirm ? (
          <div className="flex gap-1">
            <button onClick={() => onDelete(a.id)} className="text-[10px] text-red-400 border border-red-500/30 rounded px-2 py-1 hover:bg-red-500/10 transition-all">Supprimer</button>
            <button onClick={() => setConfirm(false)} className="text-[10px] text-white/30 border border-white/10 rounded px-2 py-1">Annuler</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all rounded-lg">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------
export function AdminAnalysesTab() {
  const [analyses, setAnalyses] = useState<AnalysisAdmin[]>([]);
  const [projects, setProjects] = useState<ProjectSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [, setHovered] = useState<AnalysisAdmin | null>(null);

  useEffect(() => {
    setLoading(true);
    void Promise.all([
      fetch(`${BASE}/api/manuscripts`).then(r => r.ok ? r.json() as Promise<AnalysisAdmin[]> : []),
      fetch(`${BASE}/api/projects`).then(r => r.ok ? r.json() as Promise<ProjectSimple[]> : []),
    ]).then(([a, p]) => {
      setAnalyses(a as AnalysisAdmin[]);
      setProjects(p as ProjectSimple[]);
      setLoading(false);
    });
  }, []);

  const projectMap = new Map(projects.map(p => [p.id, p]));

  // Assign deterministic colors per project
  const projectIds = Array.from(new Set(analyses.filter(a => a.projectId).map(a => a.projectId as string)));
  const colorMap = new Map<string | null | undefined, string>();
  projectIds.forEach((pid, i) => colorMap.set(pid, PROJECT_COLORS[i % PROJECT_COLORS.length]));
  colorMap.set(null, "rgba(255,255,255,0.2)");
  colorMap.set(undefined, "rgba(255,255,255,0.2)");
  const colorOf = (pid: string | null | undefined) => colorMap.get(pid) ?? PROJECT_COLORS[0];

  // Delete
  const deleteAnalysis = async (id: string) => {
    await fetch(`${BASE}/api/manuscripts/${id}`, { method: "DELETE" });
    setAnalyses(a => a.filter(x => x.id !== id));
  };

  // Stats
  const total = analyses.length;
  const avgGlobal = total ? Math.round(analyses.reduce((s, a) => s + a.globalScore, 0) / total) : 0;
  const withCoh = analyses.filter(a => a.coherenceScore > 0);
  const avgCoh = withCoh.length ? Math.round(withCoh.reduce((s, a) => s + a.coherenceScore, 0) / withCoh.length) : 0;
  const totalWords = analyses.reduce((s, a) => s + a.wordCount, 0);
  const best = total ? Math.max(...analyses.map(a => a.globalScore)) : 0;

  // Per-project groups (for breakdown table + filter)
  const byProject = new Map<string, AnalysisAdmin[]>();
  for (const a of analyses) {
    const k = a.projectId ?? "_standalone";
    byProject.set(k, [...(byProject.get(k) ?? []), a]);
  }
  const projectGroups = Array.from(byProject.entries())
    .sort((a, b) => {
      const aLast = Math.max(...a[1].map(x => new Date(x.createdAt).getTime()));
      const bLast = Math.max(...b[1].map(x => new Date(x.createdAt).getTime()));
      return bLast - aLast;
    });

  // Filtered + sorted analyses for the list
  const filteredAnalyses = [...(filter === "all" ? analyses : analyses.filter(a => (a.projectId ?? "_standalone") === filter))]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
        <p className="text-sm text-white/30">Chargement des analyses...</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="text-center py-24 border border-white/[0.06] rounded-2xl">
        <ScanText className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-sm font-semibold text-white/30 mb-2">Aucune analyse effectuée</p>
        <p className="text-xs text-white/15">Les analyses de manuscrits apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── KPI CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: ScanText, label: "Total analyses", value: String(total), color: "text-violet-300", sub: "sur tous les projets" },
          { icon: BarChart2, label: "Score moyen", value: `${avgGlobal}/100`, color: avgGlobal >= 70 ? "text-violet-300" : avgGlobal >= 50 ? "text-indigo-300" : "text-amber-300", sub: "global pondéré" },
          { icon: Target, label: "Cohérence moy.", value: avgCoh > 0 ? `${avgCoh}/100` : "—", color: "text-green-300", sub: "vs matrice narrative" },
          { icon: Trophy, label: "Meilleur score", value: `${best}/100`, color: "text-amber-300", sub: "record toutes sessions" },
          { icon: FileText, label: "Mots analysés", value: totalWords > 999 ? `${Math.round(totalWords / 1000)}k` : String(totalWords), color: "text-blue-300", sub: "cumul total" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <s.icon className={cn("w-3.5 h-3.5", s.color)} />
              <span className="text-[10px] text-white/20 uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={cn("text-2xl font-bold leading-none", s.color)}>{s.value}</p>
            <p className="text-[10px] text-white/15 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── GLOBAL CHART ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white/80">Timeline globale</h3>
            <p className="text-xs text-white/25 mt-0.5">Toutes les analyses · taille du point = score de cohérence</p>
          </div>
          {/* Legend */}
          <div className="hidden md:flex flex-wrap gap-3">
            {projectGroups.slice(0, 5).map(([pid]) => {
              const proj = pid !== "_standalone" ? projectMap.get(pid) : undefined;
              return (
                <div key={pid} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorOf(pid === "_standalone" ? null : pid) }} />
                  <span className="text-[10px] text-white/35">{proj?.title ?? "Sans projet"}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <GlobalChart analyses={analyses} projectMap={projectMap} colorOf={colorOf} onHover={setHovered} />
        </div>
      </div>

      {/* ── PER-PROJECT BREAKDOWN ───────────────────── */}
      {projectGroups.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />Progression par projet
          </h3>
          <div className="space-y-2">
            {projectGroups.map(([pid, pas]) => (
              <ProjectRow key={pid}
                pid={pid}
                analyses={pas}
                project={pid !== "_standalone" ? projectMap.get(pid) : undefined}
                color={colorOf(pid === "_standalone" ? null : pid)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── FULL ANALYSES LIST ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-indigo-400" />
            Toutes les analyses
            <span className="text-xs text-white/25 font-normal">({filteredAnalyses.length})</span>
          </h3>
          {/* Project filter */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilter("all")}
              className={cn("text-xs px-3 py-1.5 rounded-lg border transition-all font-medium",
                filter === "all" ? "bg-violet-600/80 text-white border-violet-500/40" : "bg-white/[0.03] text-white/35 border-white/[0.07] hover:text-white/60")}>
              Tous ({total})
            </button>
            {projectGroups.map(([pid, pas]) => {
              const proj = pid !== "_standalone" ? projectMap.get(pid) : undefined;
              return (
                <button key={pid} onClick={() => setFilter(pid)}
                  className={cn("text-xs px-3 py-1.5 rounded-lg border transition-all font-medium",
                    filter === pid ? "bg-violet-600/80 text-white border-violet-500/40" : "bg-white/[0.03] text-white/35 border-white/[0.07] hover:text-white/60")}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: colorOf(pid === "_standalone" ? null : pid) }} />
                  {proj?.title ?? "Sans projet"} ({pas.length})
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          {filteredAnalyses.map(a => (
            <AnalysisRow key={a.id} a={a}
              project={a.projectId ? projectMap.get(a.projectId) : undefined}
              color={colorOf(a.projectId)}
              onDelete={id => void deleteAnalysis(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
