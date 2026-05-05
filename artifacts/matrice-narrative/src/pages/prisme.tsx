import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetSruScore, useGenerateSruScore, getGetSruScoreQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Aperture, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { motion } from "framer-motion";

type TraditionMatch = { name: string; match: number; justification: string };
type SruCommentKey = "etincelleComment" | "vibrationComment" | "profondeurComment" | "maitriseComment";

const AXES = [
  {
    key: "etincelle",
    label: "Étincelle",
    commentKey: "etincelleComment" as SruCommentKey,
    icon: "✨",
    color: "text-amber-400",
    barColor: "bg-amber-400",
    borderColor: "border-amber-500/30",
    bg: "bg-amber-950/20",
    hex: "#fbbf24",
    public: "Public enfant · 4–12 ans",
    description: "Émerveillement, magie narrative, peur salvatrice, joie pure",
  },
  {
    key: "vibration",
    label: "Vibration",
    commentKey: "vibrationComment" as SruCommentKey,
    icon: "⚡",
    color: "text-emerald-400",
    barColor: "bg-emerald-400",
    borderColor: "border-emerald-500/30",
    bg: "bg-emerald-950/20",
    hex: "#34d399",
    public: "Public jeune · 13–25 ans",
    description: "Authenticité, identité, rébellion juste, découverte du monde",
  },
  {
    key: "profondeur",
    label: "Profondeur",
    commentKey: "profondeurComment" as SruCommentKey,
    icon: "🌊",
    color: "text-blue-400",
    barColor: "bg-blue-400",
    borderColor: "border-blue-500/30",
    bg: "bg-blue-950/20",
    hex: "#60a5fa",
    public: "Public adulte · 26–60 ans",
    description: "Complexité psychologique, nuance, portée sociale, résonance intime",
  },
  {
    key: "maitrise",
    label: "Maîtrise",
    commentKey: "maitriseComment" as SruCommentKey,
    icon: "🎬",
    color: "text-violet-400",
    barColor: "bg-violet-400",
    borderColor: "border-violet-500/30",
    bg: "bg-violet-950/20",
    hex: "#a78bfa",
    public: "Spécialistes · Professionnels",
    description: "Innovation formelle, traditions du cinéma, économie du langage",
  },
];

const NIVEAU_COLORS: Record<string, string> = {
  FRAGILE: "text-red-400 bg-red-950/40 border-red-500/30",
  "EN DEVENIR": "text-orange-400 bg-orange-950/40 border-orange-500/30",
  SOLIDE: "text-yellow-400 bg-yellow-950/40 border-yellow-500/30",
  REMARQUABLE: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30",
  EXCEPTIONNEL: "text-violet-300 bg-violet-950/40 border-violet-500/30",
};

function SruDial({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 85 ? "#a78bfa" : pct >= 75 ? "#34d399" : pct >= 65 ? "#fbbf24" : pct >= 50 ? "#f97316" : "#ef4444";
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="46" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-serif" style={{ color }}>{Math.round(pct)}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-mono">Score de Résonance Universelle</p>
    </div>
  );
}

function AudienceCard({ axe, score, comment }: { axe: typeof AXES[0]; score: number; comment: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`${axe.bg} ${axe.borderColor} border backdrop-blur-sm`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{axe.icon}</span>
              <div>
                <p className={`font-semibold text-sm ${axe.color}`}>{axe.label}</p>
                <p className="text-[10px] text-muted-foreground">{axe.public}</p>
              </div>
            </div>
            <span className={`text-2xl font-black font-serif ${axe.color}`}>
              {score}<span className="text-xs font-normal text-muted-foreground">/100</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full ${axe.barColor} transition-all duration-1000`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed italic">{comment}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TraditionBadge({ tradition }: { tradition: TraditionMatch }) {
  const matchColor = tradition.match >= 85 ? "#a78bfa" : tradition.match >= 75 ? "#34d399" : tradition.match >= 65 ? "#fbbf24" : "#94a3b8";
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-xl border"
      style={{ borderColor: matchColor + "40", backgroundColor: matchColor + "12" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{tradition.name}</span>
        <span className="font-black text-sm flex-shrink-0" style={{ color: matchColor }}>{tradition.match}%</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{tradition.justification}</p>
    </div>
  );
}

export default function PrismePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: sru, isLoading, isError } = useGetSruScore(id!, {
    query: { enabled: !!id, queryKey: getGetSruScoreQueryKey(id!), retry: false }
  });
  const generate = useGenerateSruScore();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSruScoreQueryKey(id!) });
        toast({ title: "Prisme des Quatre Publics généré" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur lors de la génération" })
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!sru || isError) {
    return (
      <AppLayout>
        <GenerateEmptyState
          title="Prisme des Quatre Publics"
          description="Analyse de résonance universelle sur 4 axes : Étincelle (enfants), Vibration (jeunes), Profondeur (adultes), Maîtrise (spécialistes). Génère un Score de Résonance Universelle (SRU) basé sur l'ensemble de ton projet et le compare aux grandes traditions du cinéma mondial."
          buttonLabel="Lancer l'analyse Prisme"
          onGenerate={handleGenerate}
          isLoading={generate.isPending}
        />
      </AppLayout>
    );
  }

  const scores = {
    etincelle: sru.etincelle ?? 0,
    vibration: sru.vibration ?? 0,
    profondeur: sru.profondeur ?? 0,
    maitrise: sru.maitrise ?? 0,
  };

  const radarData = AXES.map((axe) => ({
    subject: axe.label,
    score: scores[axe.key as keyof typeof scores],
    fullMark: 100,
  }));

  const traditions = (sru.traditions ?? []) as TraditionMatch[];
  const niveauClass = NIVEAU_COLORS[sru.niveauResonance ?? "SOLIDE"] ?? NIVEAU_COLORS["SOLIDE"];

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Aperture className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Prisme des Quatre Publics</h1>
              <p className="text-sm text-muted-foreground">Score de Résonance Universelle — Moyenne arithmétique</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="gap-2"
          >
            {generate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Régénérer
          </Button>
        </div>

        {/* SRU Score + Radar */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm flex flex-col items-center justify-center py-8">
            <SruDial score={sru.sru ?? 0} />
            <div className="mt-4 text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${niveauClass}`}>
                {sru.niveauResonance}
              </span>
            </div>
            <div className="mt-4 px-6 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                ({scores.etincelle} + {scores.vibration} + {scores.profondeur} + {scores.maitrise}) ÷ 4 = <span className="text-primary font-bold">{sru.sru}</span>
              </p>
            </div>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">Radar de résonance</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 4 Audience Cards */}
        <div className="grid grid-cols-2 gap-4">
          {AXES.map((axe) => (
            <AudienceCard
              key={axe.key}
              axe={axe}
              score={scores[axe.key as keyof typeof scores]}
              comment={sru[axe.commentKey] ?? ""}
            />
          ))}
        </div>

        {/* Synthèse globale */}
        {sru.syntheseGlobale && (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                Synthèse de l'analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">{sru.syntheseGlobale}</p>
            </CardContent>
          </Card>
        )}

        {/* Tradition Badges */}
        {traditions.length > 0 && (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">
                Sceaux de Tradition Cinématographique
              </CardTitle>
              <p className="text-xs text-muted-foreground/70">
                Correspondances détectées avec la base cinéma mondial · Seuil 65%
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {traditions.map((t, i) => (
                  <TraditionBadge key={i} tradition={t} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
