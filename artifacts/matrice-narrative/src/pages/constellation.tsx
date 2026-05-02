import { useState } from "react";
import { useParams } from "wouter";
import { useListCharacters, useListRelationships, getListCharactersQueryKey, getListRelationshipsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const REL_COLORS: Record<string, string> = {
  amour: "#f59e0b",
  romance: "#f59e0b",
  amitié: "#22c55e",
  alliance: "#3b82f6",
  conflit: "#ef4444",
  rivalité: "#f97316",
  haine: "#dc2626",
  famille: "#8b5cf6",
  mentor: "#06b6d4",
  trahison: "#dc2626",
  default: "#6366f1",
};

function getRelColor(type: string): string {
  const t = type.toLowerCase();
  for (const key of Object.keys(REL_COLORS)) {
    if (t.includes(key)) return REL_COLORS[key];
  }
  return REL_COLORS.default;
}

type Character = {
  id: string; name: string; role: string; wound?: string | null; fear?: string | null;
  externalObjective?: string | null; visualIdentity?: string | null;
};

type Relationship = {
  id: string; characterAName: string; characterBName: string;
  relationshipType: string; emotionalTension?: string | null;
};

function getPositions(n: number, cx: number, cy: number, r: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

export default function ConstellationPage() {
  const { id } = useParams<{ id: string }>();
  const [selected, setSelected] = useState<Character | null>(null);

  const { data: chars, isLoading: charsLoading } = useListCharacters(id!, {
    query: { enabled: !!id, queryKey: getListCharactersQueryKey(id!) }
  });

  const { data: relsRaw, isLoading: relsLoading } = useListRelationships(id!, {
    query: { enabled: !!id, queryKey: getListRelationshipsQueryKey(id!) }
  });

  const isLoading = charsLoading || relsLoading;
  const characters = (chars ?? []) as Character[];
  const relationships = (relsRaw ?? []) as Relationship[];

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!characters.length) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Constellation</h1>
          <p className="text-muted-foreground max-w-sm">
            Créez d'abord vos personnages pour voir leur constellation relationnelle.
          </p>
        </div>
        <Link href={`/projects/${id}/characters`}>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
            Créer des personnages
          </Button>
        </Link>
      </div>
    </AppLayout>
  );

  const W = 700, H = 500;
  const cx = W / 2, cy = H / 2;
  const radius = Math.min(cx, cy) * 0.7;
  const positions = getPositions(characters.length, cx, cy, characters.length === 1 ? 0 : radius);

  function findPos(name: string) {
    const i = characters.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    if (i === -1) return null;
    return positions[i];
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold">Constellation</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {characters.length} personnage{characters.length > 1 ? "s" : ""} — {relationships.length} relation{relationships.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SVG Star Map */}
          <div className="flex-1 bg-[#0d0b14] border border-white/[0.06] rounded-2xl overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: "500px" }}>
              {/* Ambient glow */}
              <defs>
                <radialGradient id="bgGlow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0d0b14" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="#0d0b14" />
              <circle cx={cx} cy={cy} r={radius + 20} fill="url(#bgGlow)" />

              {/* Relationship lines */}
              {relationships.map((rel, i) => {
                const posA = findPos(rel.characterAName);
                const posB = findPos(rel.characterBName);
                if (!posA || !posB) return null;
                const color = getRelColor(rel.relationshipType);
                return (
                  <g key={rel.id}>
                    <line
                      x1={posA.x} y1={posA.y} x2={posB.x} y2={posB.y}
                      stroke={color} strokeWidth={1.5} strokeOpacity={0.35} strokeDasharray="4 3"
                    />
                    {/* Midpoint label */}
                    <text
                      x={(posA.x + posB.x) / 2} y={(posA.y + posB.y) / 2 - 4}
                      fill={color} fillOpacity={0.6} fontSize={9} textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {rel.relationshipType.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Character nodes */}
              {characters.map((char, i) => {
                const pos = positions[i];
                const isSelected = selected?.id === char.id;
                return (
                  <g key={char.id} className="cursor-pointer" onClick={() => setSelected(isSelected ? null : char)}>
                    {/* Outer glow */}
                    <circle cx={pos.x} cy={pos.y} r={isSelected ? 26 : 20} fill="#7c3aed" fillOpacity={isSelected ? 0.25 : 0.1} />
                    {/* Main circle */}
                    <circle
                      cx={pos.x} cy={pos.y} r={isSelected ? 18 : 14}
                      fill={isSelected ? "#4c1d95" : "#1a1225"}
                      stroke={isSelected ? "#7c3aed" : "#4c1d95"}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                    {/* Initial */}
                    <text
                      x={pos.x} y={pos.y + 4} textAnchor="middle"
                      fill={isSelected ? "#e9d5ff" : "#a78bfa"}
                      fontSize={12} fontWeight="bold" fontFamily="serif"
                    >
                      {char.name.charAt(0).toUpperCase()}
                    </text>
                    {/* Name label */}
                    <text
                      x={pos.x} y={pos.y + 32} textAnchor="middle"
                      fill={isSelected ? "#e9d5ff" : "rgba(255,255,255,0.5)"}
                      fontSize={10} fontFamily="sans-serif"
                    >
                      {char.name.length > 12 ? char.name.slice(0, 12) + "…" : char.name}
                    </text>
                    <text
                      x={pos.x} y={pos.y + 44} textAnchor="middle"
                      fill="rgba(255,255,255,0.2)"
                      fontSize={8} fontFamily="sans-serif" fontStyle="italic"
                    >
                      {char.role?.slice(0, 14)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-white/[0.04] flex flex-wrap gap-3">
              {[["Amour / Romance", "#f59e0b"], ["Alliance / Amitié", "#22c55e"], ["Conflit / Rivalité", "#ef4444"], ["Famille", "#8b5cf6"], ["Mentor", "#06b6d4"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-px" style={{ background: color }} />
                  <span className="text-[10px] text-white/30">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Character Detail Panel */}
          <div className="lg:w-64 flex-shrink-0">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="bg-[#0d0b14] border border-violet-500/25 rounded-2xl p-5 space-y-4">
                <div>
                  <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-3">
                    <span className="text-xl font-serif font-bold text-violet-300">
                      {selected.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{selected.name}</h3>
                  <p className="text-xs text-violet-400/70 italic">{selected.role}</p>
                </div>
                {selected.externalObjective && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Objectif</p>
                    <p className="text-xs text-white/55 leading-relaxed">{selected.externalObjective}</p>
                  </div>
                )}
                {selected.wound && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Blessure</p>
                    <p className="text-xs text-white/55 leading-relaxed">{selected.wound}</p>
                  </div>
                )}
                {selected.fear && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Peur</p>
                    <p className="text-xs text-white/55 leading-relaxed">{selected.fear}</p>
                  </div>
                )}
                {selected.visualIdentity && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Identité visuelle</p>
                    <p className="text-xs text-white/55 italic leading-relaxed">{selected.visualIdentity}</p>
                  </div>
                )}
                <Link href={`/projects/${id}/dialogue`}>
                  <Button size="sm" variant="outline" className="w-full text-xs mt-2">
                    Parler à {selected.name.split(" ")[0]}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="bg-[#0d0b14] border border-white/[0.06] rounded-2xl p-5 text-center">
                <p className="text-xs text-white/25">Cliquez sur un personnage pour voir ses détails</p>
              </div>
            )}

            {/* Relations involving selected character */}
            {selected && relationships.filter(r => r.characterAName.toLowerCase() === selected.name.toLowerCase() || r.characterBName.toLowerCase() === selected.name.toLowerCase()).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-white/30 uppercase tracking-wider px-1">Relations</p>
                {relationships
                  .filter(r => r.characterAName.toLowerCase() === selected.name.toLowerCase() || r.characterBName.toLowerCase() === selected.name.toLowerCase())
                  .map(r => {
                    const other = r.characterAName.toLowerCase() === selected.name.toLowerCase() ? r.characterBName : r.characterAName;
                    return (
                      <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0d0b14] border border-white/[0.05]">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getRelColor(r.relationshipType) }} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white/70 truncate">{other}</p>
                          <p className="text-[10px] text-white/30">{r.relationshipType}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
