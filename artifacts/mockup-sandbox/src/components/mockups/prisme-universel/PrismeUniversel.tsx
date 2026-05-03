import { useState } from "react";

const PROJECT = {
  title: "Les Nuits de Carthage",
  author: "Sonia Mezghani",
  genre: "Drame historique",
  scores: {
    etincelle: 81,
    vibration: 74,
    profondeur: 88,
    maitrise: 92,
  },
  traditions: [
    { name: "Cinéma des Indépendants Arabes", match: 94, color: "#a78bfa" },
    { name: "Néoréalisme Méditerranéen", match: 87, color: "#818cf8" },
    { name: "Nouvelle Vague (influences formelles)", match: 72, color: "#6366f1" },
  ],
  validations: [
    { specialist: "Prof. Ahmad Karimi-Hakkak", role: "Cinéma du Monde Arabe — Johns Hopkins", note: 91, comment: "Structure dramatique d'une rare cohérence. La langue du silence y est maîtrisée." },
    { specialist: "Dr. Fatima Daas", role: "Narratologie — Paris VIII", note: 88, comment: "Le tissage des temporalités est exceptionnel pour un premier long." },
    { specialist: "Selim Sahli", role: "Directeur Artistique — JCC Tunis", note: 95, comment: "Ce projet mérite le grand jury. Il parle à tous les publics." },
  ],
};

function RadarChart({ scores }: { scores: typeof PROJECT.scores }) {
  const cx = 160;
  const cy = 160;
  const r = 110;
  const axes = [
    { key: "etincelle", label: "Étincelle", icon: "✨", color: "#fbbf24", angle: -90 },
    { key: "vibration", label: "Vibration", icon: "⚡", color: "#34d399", angle: 0 },
    { key: "profondeur", label: "Profondeur", icon: "🌊", color: "#60a5fa", angle: 90 },
    { key: "maitrise", label: "Maîtrise", icon: "🎬", color: "#c084fc", angle: 180 },
  ];

  const toXY = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const gridLevels = [25, 50, 75, 100];
  const scoreKeys = ["etincelle", "vibration", "profondeur", "maitrise"] as const;

  const dataPoints = axes.map((a, i) => {
    const val = scores[a.key as keyof typeof scores];
    return toXY(a.angle, (val / 100) * r);
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={320} height={320} viewBox="0 0 320 320">
        {gridLevels.map((level) => {
          const pts = axes.map((a) => {
            const p = toXY(a.angle, (level / 100) * r);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="rgba(139,92,246,0.2)"
              strokeWidth={1}
            />
          );
        })}

        {axes.map((a) => {
          const end = toXY(a.angle, r);
          return (
            <line
              key={a.key}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(139,92,246,0.25)"
              strokeWidth={1}
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(139,92,246,0.18)"
          stroke="#8b5cf6"
          strokeWidth={2}
        />

        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={axes[i].color} />
        ))}

        {axes.map((a) => {
          const labelPos = toXY(a.angle, r + 28);
          const val = scores[a.key as keyof typeof scores];
          return (
            <g key={a.key}>
              <text x={labelPos.x} y={labelPos.y - 8} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={600}>
                {a.icon} {a.label}
              </text>
              <text x={labelPos.x} y={labelPos.y + 8} textAnchor="middle" fill={a.color} fontSize={13} fontWeight={700}>
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AudienceCard({ icon, label, sublabel, score, color, description, bg }: {
  icon: string; label: string; sublabel: string; score: number;
  color: string; description: string; bg: string;
}) {
  return (
    <div className={`rounded-xl p-4 border border-white/10 ${bg} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="text-white font-semibold text-sm">{label}</div>
            <div className="text-white/50 text-xs">{sublabel}</div>
          </div>
        </div>
        <div className="text-2xl font-black" style={{ color }}>{score}</div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <p className="text-white/60 text-xs leading-relaxed">{description}</p>
    </div>
  );
}

function SpecialistCard({ validation }: { validation: typeof PROJECT.validations[0] }) {
  return (
    <div className="bg-white/5 border border-violet-500/20 rounded-xl p-4 flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center text-lg">
        🎓
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-white font-semibold text-sm">{validation.specialist}</div>
            <div className="text-white/50 text-xs">{validation.role}</div>
          </div>
          <div className="text-lg font-black text-violet-300">{validation.note}<span className="text-xs text-white/40">/100</span></div>
        </div>
        <p className="text-white/70 text-sm italic leading-relaxed">« {validation.comment} »</p>
      </div>
    </div>
  );
}

export function PrismeUniversel() {
  const [activeTab, setActiveTab] = useState<"prisme" | "validations">("prisme");
  const { scores } = PROJECT;
  const sru = Math.round((scores.etincelle + scores.vibration + scores.profondeur + scores.maitrise) / 4);
  const validationMoyenne = Math.round(PROJECT.validations.reduce((a, v) => a + v.note, 0) / PROJECT.validations.length);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #130f40 40%, #1a0533 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-violet-400 font-mono uppercase tracking-widest">Moteur d'Analyse Universelle</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 text-xs font-semibold border border-violet-500/30">PHASE 2</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Prisme des Quatre Publics</h1>
          <p className="text-white/50 text-sm mt-1">Score de Résonance Universelle — Moyenne arithmétique pondérée</p>
        </div>

        {/* Project banner */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Projet analysé</div>
            <div className="text-white text-xl font-bold">{PROJECT.title}</div>
            <div className="text-white/50 text-sm mt-0.5">{PROJECT.author} · {PROJECT.genre}</div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Score SRU</div>
            <div
              className="text-6xl font-black"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {sru}
            </div>
            <div className="text-white/40 text-xs">/ 100</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "prisme", label: "🔮 Prisme des publics" },
            { key: "validations", label: "🎓 Validations spécialistes" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "prisme" && (
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Radar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
              <div className="text-white/40 text-xs uppercase tracking-widest mb-4">Radar de résonance</div>
              <RadarChart scores={scores} />
              <div className="mt-4 text-center">
                <div className="text-white/40 text-xs mb-1">Formule</div>
                <div className="text-white/70 text-xs font-mono bg-white/5 rounded px-3 py-1.5">
                  SRU = (✨{scores.etincelle} + ⚡{scores.vibration} + 🌊{scores.profondeur} + 🎬{scores.maitrise}) ÷ 4 = <span className="text-violet-300 font-bold">{sru}</span>
                </div>
              </div>
            </div>

            {/* Right: 4 cards */}
            <div className="flex flex-col gap-3">
              <AudienceCard
                icon="✨" label="Étincelle" sublabel="Public enfant · 4–12 ans" score={scores.etincelle}
                color="#fbbf24" bg="bg-amber-950/30"
                description="Émerveillement, magie narrative, peur salvatrice, joie pure. L'histoire crée-t-elle des images que l'enfant peut habiter ?"
              />
              <AudienceCard
                icon="⚡" label="Vibration" sublabel="Public jeune · 13–25 ans" score={scores.vibration}
                color="#34d399" bg="bg-emerald-950/30"
                description="Authenticité, identité, rébellion juste, découverte du monde. Le film parle-t-il à celui qu'on est en train de devenir ?"
              />
              <AudienceCard
                icon="🌊" label="Profondeur" sublabel="Public adulte · 26–60 ans" score={scores.profondeur}
                color="#60a5fa" bg="bg-blue-950/30"
                description="Complexité psychologique, nuance morale, portée sociale, résonance intime. Le film pense-t-il autant qu'il ressent ?"
              />
              <AudienceCard
                icon="🎬" label="Maîtrise" sublabel="Spécialistes · Professionnels" score={scores.maitrise}
                color="#c084fc" bg="bg-purple-950/30"
                description="Innovation formelle, conscience des traditions, économie du langage, précision des choix. Le film sait-il ce qu'il est ?"
              />
            </div>
          </div>
        )}

        {activeTab === "prisme" && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-4">Sceaux de Tradition Cinématographique</div>
            <div className="flex flex-wrap gap-3">
              {PROJECT.traditions.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full border"
                  style={{ borderColor: t.color + "50", backgroundColor: t.color + "15" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-white text-sm font-medium">{t.name}</span>
                  <span className="font-bold text-sm" style={{ color: t.color }}>{t.match}%</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-3">
              Correspondances détectées par le moteur IA via la base cinéma mondial (36 entrées actives) · Seuil de détection : 70%
            </p>
          </div>
        )}

        {activeTab === "validations" && (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-center gap-6">
              <div className="text-center">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Score moyen spécialistes</div>
                <div className="text-5xl font-black" style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {validationMoyenne}
                </div>
                <div className="text-white/40 text-xs">/ 100 · {PROJECT.validations.length} validateurs</div>
              </div>
              <div className="flex-1 border-l border-white/10 pl-6">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Consensus</div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${validationMoyenne}%` }} />
                </div>
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>Insuffisant</span>
                  <span>Remarquable</span>
                  <span>Exceptionnel</span>
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-center">
                <div className="text-violet-300 text-xs font-semibold mb-1">Niveau atteint</div>
                <div className="text-white font-black text-lg">SÉLECTION</div>
                <div className="text-violet-400 text-xs">Festival / Financement</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {PROJECT.validations.map((v, i) => (
                <SpecialistCard key={i} validation={v} />
              ))}
            </div>

            <div className="mt-6 bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <div className="text-white font-semibold text-sm mb-1">Validation par les pairs — Comment ça marche</div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Des spécialistes sélectionnés (universitaires, directeurs artistiques, programmateurs de festivals) lisent et notent les projets selon 6 critères narratifs. 
                  Leur score alimente le Score SRU final. Seuls les projets avec 3+ validations affichent le badge <span className="text-violet-300 font-semibold">Consensus Expert</span>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
