import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetHpsaScore, useGenerateHpsaScore, getGetHpsaScoreQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, AlertTriangle, Lightbulb, Zap, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";

type ScoreCategory = {
  score: number;
  diagnostic: string;
  weaknesses: string[];
  corrections: string[];
  suggestions?: string[];
  trendNotes?: string;
  humorSources?: string[];
  tearTriggerMechanisms?: string[];
  suspenseMechanisms?: string[];
  attractivenessFactors?: string[];
  clicheRisk?: string;
  originalityOpportunity?: string;
};

const AXES: { key: string; label: string; emoji: string; color: string; bgColor: string; borderColor: string; description: string }[] = [
  {
    key: "humour",
    label: "Humour",
    emoji: "😄",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    description: "Présence & qualité comique",
  },
  {
    key: "pleur",
    label: "Pleur",
    emoji: "💧",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Puissance émotionnelle",
  },
  {
    key: "suspense",
    label: "Suspense",
    emoji: "⚡",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Tension narrative",
  },
  {
    key: "attractivite",
    label: "Attractivité",
    emoji: "✨",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    description: "Désirabilité du projet",
  },
];

function GlobalScoreDial({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 75 ? "#22c55e" : pct >= 55 ? "#eab308" : "#ef4444";
  const label = pct >= 75 ? "Excellent" : pct >= 60 ? "Solide" : pct >= 45 ? "À travailler" : "Fragile";
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-serif" style={{ color }}>{Math.round(pct)}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground">Score global H.P.S.A.</p>
      </div>
    </div>
  );
}

function ScoreCard({ axe, data }: { axe: typeof AXES[0]; data: ScoreCategory }) {
  const [open, setOpen] = useState(false);
  const pct = data.score;
  const barColor = pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  const mechanisms = data.humorSources ?? data.tearTriggerMechanisms ?? data.suspenseMechanisms ?? data.attractivenessFactors ?? [];

  return (
    <Card className={`bg-card/50 border-border/50 backdrop-blur-sm transition-all ${axe.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{axe.emoji}</span>
            <div>
              <CardTitle className={`text-base font-semibold ${axe.color}`}>{axe.label}</CardTitle>
              <p className="text-[10px] text-muted-foreground/60">{axe.description}</p>
            </div>
          </div>
          <span className={`text-2xl font-bold font-serif ${axe.color}`}>{pct}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/80">{data.diagnostic}</p>

        {mechanisms.length > 0 && (
          <div className={`rounded-lg p-2.5 ${axe.bgColor} border ${axe.borderColor}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${axe.color}`}>Mécanismes actifs</p>
            {mechanisms.map((m, i) => <p key={i} className="text-xs text-foreground/70">· {m}</p>)}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {open ? "Masquer l'analyse" : "Voir l'analyse complète"}
        </button>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 overflow-hidden"
          >
            {data.weaknesses?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-yellow-400 flex items-center gap-1 mb-1.5"><AlertTriangle className="w-3 h-3" />Faiblesses</p>
                {data.weaknesses.map((w, i) => <p key={i} className="text-xs text-muted-foreground pl-3 border-l border-yellow-500/30 mb-1">· {w}</p>)}
              </div>
            )}
            {data.corrections?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-primary flex items-center gap-1 mb-1.5"><Lightbulb className="w-3 h-3" />Corrections</p>
                {data.corrections.map((c, i) => <p key={i} className="text-xs text-muted-foreground pl-3 border-l border-primary/30 mb-1">· {c}</p>)}
              </div>
            )}
            {data.trendNotes && (
              <div className="bg-background/30 rounded p-2.5">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Tendances marché</p>
                <p className="text-xs text-muted-foreground/80 italic">{data.trendNotes}</p>
              </div>
            )}
            {data.clicheRisk && (
              <p className="text-xs text-orange-400/80 italic">⚠ {data.clicheRisk}</p>
            )}
            {data.originalityOpportunity && (
              <p className="text-xs text-green-400/80 italic">💡 {data.originalityOpportunity}</p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HpsaPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: hpsa, isLoading } = useGetHpsaScore(id!, {
    query: { enabled: !!id, queryKey: getGetHpsaScoreQueryKey(id!) }
  });
  const generate = useGenerateHpsaScore();

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetHpsaScoreQueryKey(id!) });
        toast({ title: "Scores H.P.S.A. générés" });
      },
      onError: () => toast({ variant: "destructive", title: "Erreur" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  if (!hpsa) return (
    <AppLayout>
      <GenerateEmptyState
        title="Scores H.P.S.A."
        description="Analyse dramaturgique complète sur 4 axes fondamentaux : Humour, Pleur, Suspense, Attractivité. Basée sur les neurosciences de l'émotion et les mécanismes narratifs universels."
        buttonLabel="Lancer l'analyse H.P.S.A."
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const scores: Record<string, ScoreCategory> = {
    humour: hpsa.humour as unknown as ScoreCategory,
    pleur: hpsa.pleur as unknown as ScoreCategory,
    suspense: hpsa.suspense as unknown as ScoreCategory,
    attractivite: hpsa.attractivite as unknown as ScoreCategory,
  };

  const globalScore = (hpsa.globalScore as unknown as number) ?? 0;
  const priorityFixes = (hpsa.priorityFixes as unknown as string[]) ?? [];

  const radarData = AXES.map((axe) => ({
    subject: axe.label,
    score: scores[axe.key]?.score ?? 0,
    fullMark: 100,
  }));

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Scores H.P.S.A.</h1>
            <p className="text-muted-foreground mt-1">Analyse dramaturgique — Humour · Pleur · Suspense · Attractivité</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        {/* Overview panel */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Radar */}
              <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Global score dial */}
              <div className="flex-shrink-0">
                <GlobalScoreDial score={globalScore} />
              </div>

              {/* Mini axis scores */}
              <div className="flex-shrink-0 space-y-3 min-w-[140px]">
                {AXES.map((axe) => {
                  const s = scores[axe.key]?.score ?? 0;
                  return (
                    <div key={axe.key} className="flex items-center gap-2">
                      <span className="text-base">{axe.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className={`text-xs font-medium ${axe.color}`}>{axe.label}</span>
                          <span className={`text-xs font-bold ${axe.color}`}>{s}</span>
                        </div>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${s >= 70 ? "bg-green-500" : s >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${s}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority fixes */}
        {priorityFixes.length > 0 && (
          <Card className="bg-card/50 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Corrections prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {priorityFixes.map((fix, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
                  >
                    <span className="text-xs font-bold text-orange-400 mt-0.5 w-5 shrink-0 text-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground/80">{fix}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4-axis detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AXES.map((axe, i) => (
            <motion.div key={axe.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <ScoreCard axe={axe} data={scores[axe.key] ?? { score: 0, diagnostic: "", weaknesses: [], corrections: [] }} />
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
