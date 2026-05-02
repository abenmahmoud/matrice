import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetHpsaScore, useGenerateHpsaScore, getGetHpsaScoreQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenerateEmptyState } from "@/components/GenerateEmptyState";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

type ScoreCategory = {
  score: number;
  diagnostic: string;
  weaknesses: string[];
  corrections: string[];
  suggestions?: string[];
  trendNotes?: string;
  clicheRisk?: string;
  originalityOpportunity?: string;
};

const SCORE_LABELS: Record<string, string> = {
  humour: "Humour",
  pleur: "Pleur",
  suspense: "Suspense",
  attractivite: "Attractivité",
  profondeurEmotionnelle: "Profondeur",
  originalite: "Originalité",
  coherence: "Cohérence",
};

const SCORE_COLORS: Record<string, string> = {
  humour: "text-yellow-400",
  pleur: "text-blue-400",
  suspense: "text-red-400",
  attractivite: "text-pink-400",
  profondeurEmotionnelle: "text-purple-400",
  originalite: "text-green-400",
  coherence: "text-cyan-400",
};

function ScoreCard({ name, data }: { name: string; data: ScoreCategory }) {
  const label = SCORE_LABELS[name] ?? name;
  const colorClass = SCORE_COLORS[name] ?? "text-primary";
  const pct = data.score;
  const barColor = pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base font-semibold ${colorClass}`}>{label}</CardTitle>
          <span className={`text-2xl font-bold font-serif ${colorClass}`}>{pct}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/80">{data.diagnostic}</p>
        {data.weaknesses?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-yellow-400 flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3" />Faiblesses</p>
            {data.weaknesses.map((w, i) => <p key={i} className="text-xs text-muted-foreground pl-2 border-l border-yellow-500/30">• {w}</p>)}
          </div>
        )}
        {data.corrections?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-primary flex items-center gap-1 mb-1"><Lightbulb className="w-3 h-3" />Corrections</p>
            {data.corrections.map((c, i) => <p key={i} className="text-xs text-muted-foreground pl-2 border-l border-primary/30">• {c}</p>)}
          </div>
        )}
        {data.originalityOpportunity && (
          <p className="text-xs text-green-400/80 italic">{data.originalityOpportunity}</p>
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
        description="Évaluez l'impact narratif de votre projet : Humour, Pleur, Suspense, Attractivité, Profondeur émotionnelle, Originalité et Cohérence."
        buttonLabel="Générer les Scores H.P.S.A."
        onGenerate={handleGenerate}
        isLoading={generate.isPending}
      />
    </AppLayout>
  );

  const radarData = Object.entries(SCORE_LABELS).map(([key, label]) => ({
    subject: label,
    score: (hpsa as unknown as Record<string, ScoreCategory>)[key]?.score ?? 0,
    fullMark: 100,
  }));

  const scores: Record<string, ScoreCategory> = {
    humour: hpsa.humour as unknown as ScoreCategory,
    pleur: hpsa.pleur as unknown as ScoreCategory,
    suspense: hpsa.suspense as unknown as ScoreCategory,
    attractivite: hpsa.attractivite as unknown as ScoreCategory,
    profondeurEmotionnelle: hpsa.profondeurEmotionnelle as unknown as ScoreCategory,
    originalite: hpsa.originalite as unknown as ScoreCategory,
    coherence: hpsa.coherence as unknown as ScoreCategory,
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Scores H.P.S.A.</h1>
            <p className="text-muted-foreground mt-1">Évaluation de l'impact narratif de votre projet</p>
          </div>
          <Button onClick={handleGenerate} disabled={generate.isPending} variant="outline">
            {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Régénérer
          </Button>
        </div>

        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(scores).map(([key, data], i) => (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <ScoreCard name={key} data={data} />
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
