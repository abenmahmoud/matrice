export type LentilleScores = {
  microdrama: number;
  ai_prod: number;
  pression_spatiale: number;
  perso_deplace: number;
  hybridation: number;
  global: number;
};

export type LentilleProposition = {
  axe: string;
  proposition: string;
  impact: string;
};

export type LentilleEpisode = {
  title: string;
  summary: string;
  cliffhanger: string;
};

export type LentilleBudgetEstimate = {
  tier: "micro" | "low" | "medium" | "high";
  breakdown: {
    decors: string;
    personnages: string;
    jours_tournage: string;
  };
  total_eur_range: [number, number];
};

export type LentilleHybridationProposal = {
  genre_porte: string;
  theme_profond: string;
  exemple: string;
};

export type LentilleResult = {
  scores: LentilleScores;
  diagnostic_compatible: { points: string[] };
  diagnostic_renforcer: { points: string[] };
  propositions: LentilleProposition[];
  hook_10s: string;
  microdrama_version: { episodes: LentilleEpisode[] };
  budget_estimate: LentilleBudgetEstimate;
  hybridation_proposal: LentilleHybridationProposal;
  format_recommendation: "film" | "serie" | "microdrama" | "court" | "poc" | "multiplateforme";
  format_reasoning: string;
  meta?: {
    model: string;
    tokens: number;
    cost_eur: number;
    duration_ms: number;
  };
};

export type LentilleAnalysisRow = {
  id: string;
  projectId: string | null;
  inputLogline: string;
  inputSynopsis: string;
  inputGenre: string | null;
  inputFormatTarget: string | null;
  scoreMicrodrama: number;
  scoreAiProd: number;
  scorePressionSpatiale: number;
  scorePersoDeplace: number;
  scoreHybridation: number;
  scoreGlobal: number;
  diagnosticCompatible: { points: string[] };
  diagnosticRenforcer: { points: string[] };
  propositions: LentilleProposition[];
  hook10s: string;
  microdramaVersion: { episodes: LentilleEpisode[] };
  budgetEstimate: LentilleBudgetEstimate;
  hybridationProposal: LentilleHybridationProposal;
  formatRecommendation: LentilleResult["format_recommendation"];
  formatReasoning: string;
  modelUsed: string;
  tokensUsed: number;
  costEur: string;
  createdAt: string;
};

export type LentilleHistoryItem = Pick<
  LentilleAnalysisRow,
  "id" | "projectId" | "scoreGlobal" | "formatRecommendation" | "inputLogline" | "modelUsed" | "costEur" | "createdAt"
>;

export function analysisRowToResult(row: LentilleAnalysisRow): LentilleResult {
  return {
    scores: {
      microdrama: row.scoreMicrodrama,
      ai_prod: row.scoreAiProd,
      pression_spatiale: row.scorePressionSpatiale,
      perso_deplace: row.scorePersoDeplace,
      hybridation: row.scoreHybridation,
      global: row.scoreGlobal,
    },
    diagnostic_compatible: row.diagnosticCompatible,
    diagnostic_renforcer: row.diagnosticRenforcer,
    propositions: row.propositions,
    hook_10s: row.hook10s,
    microdrama_version: row.microdramaVersion,
    budget_estimate: row.budgetEstimate,
    hybridation_proposal: row.hybridationProposal,
    format_recommendation: row.formatRecommendation,
    format_reasoning: row.formatReasoning,
    meta: {
      model: row.modelUsed,
      tokens: row.tokensUsed,
      cost_eur: Number(row.costEur),
      duration_ms: 0,
    },
  };
}
