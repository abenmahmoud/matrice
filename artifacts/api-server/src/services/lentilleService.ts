import { getDeepSeekClient, getDeepSeekModel, computeDeepSeekCostEur, DeepSeekNotConfiguredError } from "./deepseekClient.js";
import { LENTILLE_SYSTEM_PROMPT } from "./lentilleTemplates.js";

export type LentilleFormatTarget = "film" | "serie" | "microdrama" | "open";
export type LentilleBudgetTier = "micro" | "low" | "medium" | "high";
export type LentilleRecommendation = "film" | "serie" | "microdrama" | "court" | "poc" | "multiplateforme";

export interface LentilleInput {
  logline: string;
  synopsis: string;
  genre?: string;
  format_target?: LentilleFormatTarget;
  scenes?: string[];
}

export interface LentilleResult {
  scores: {
    microdrama: number;
    ai_prod: number;
    pression_spatiale: number;
    perso_deplace: number;
    hybridation: number;
    global: number;
  };
  diagnostic_compatible: { points: string[] };
  diagnostic_renforcer: { points: string[] };
  propositions: Array<{ axe: string; proposition: string; impact: string }>;
  hook_10s: string;
  microdrama_version: {
    episodes: Array<{ title: string; summary: string; cliffhanger: string }>;
  };
  budget_estimate: {
    tier: LentilleBudgetTier;
    breakdown: { decors: string; personnages: string; jours_tournage: string };
    total_eur_range: [number, number];
  };
  hybridation_proposal: { genre_porte: string; theme_profond: string; exemple: string };
  format_recommendation: LentilleRecommendation;
  format_reasoning: string;
  meta: {
    model: string;
    tokens: number;
    cost_eur: number;
    duration_ms: number;
  };
}

export async function analyseLentille(input: LentilleInput): Promise<LentilleResult> {
  const client = getDeepSeekClient();
  if (!client) throw new DeepSeekNotConfiguredError();

  const model = getDeepSeekModel();
  const maxTokens = Number(process.env["LENTILLE_DEEPSEEK_MAX_TOKENS"] ?? 4000);
  const temperature = Number(process.env["LENTILLE_DEEPSEEK_TEMPERATURE"] ?? 0.7);
  const startedAt = Date.now();

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: LENTILLE_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
  });

  const durationMs = Date.now() - startedAt;
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("EMPTY_DEEPSEEK_RESPONSE");

  const parsed = JSON.parse(raw) as unknown;
  const sanitized = sanitizeResult(parsed);
  const usage = completion.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  return {
    ...sanitized,
    meta: {
      model,
      tokens: usage.total_tokens,
      cost_eur: computeDeepSeekCostEur(usage, model),
      duration_ms: durationMs,
    },
  };
}

function buildUserPrompt(input: LentilleInput): string {
  const scenes = input.scenes?.filter((scene) => scene.trim().length > 0).slice(0, 10) ?? [];
  return `Voici le projet narratif a analyser :

LOGLINE : ${input.logline}

SYNOPSIS : ${input.synopsis}

${input.genre ? `GENRE : ${input.genre}\n` : ""}${input.format_target ? `FORMAT VISE : ${input.format_target}\n` : ""}${scenes.length ? `SCENES CLES :\n${scenes.map((scene, index) => `${index + 1}. ${scene}`).join("\n")}\n` : ""}
Applique l'analyse Lentille Marche 2026 et reponds STRICTEMENT au format JSON specifie.`;
}

export function sanitizeResult(raw: unknown): Omit<LentilleResult, "meta"> {
  const data = isRecord(raw) ? raw : {};
  const scores = isRecord(data["scores"]) ? data["scores"] : {};
  const budget = isRecord(data["budget_estimate"]) ? data["budget_estimate"] : {};
  const budgetBreakdown = isRecord(budget["breakdown"]) ? budget["breakdown"] : {};
  const hybridation = isRecord(data["hybridation_proposal"]) ? data["hybridation_proposal"] : {};
  const microdrama = isRecord(data["microdrama_version"]) ? data["microdrama_version"] : {};

  return {
    scores: {
      microdrama: clampScore(scores["microdrama"]),
      ai_prod: clampScore(scores["ai_prod"]),
      pression_spatiale: clampScore(scores["pression_spatiale"]),
      perso_deplace: clampScore(scores["perso_deplace"]),
      hybridation: clampScore(scores["hybridation"]),
      global: clampScore(scores["global"]),
    },
    diagnostic_compatible: {
      points: clipArray(pointArray(data["diagnostic_compatible"]), 6, 500),
    },
    diagnostic_renforcer: {
      points: clipArray(pointArray(data["diagnostic_renforcer"]), 6, 500),
    },
    propositions: Array.isArray(data["propositions"])
      ? data["propositions"].slice(0, 5).map((item) => {
          const proposition = isRecord(item) ? item : {};
          return {
            axe: cleanText(proposition["axe"], 100),
            proposition: cleanText(proposition["proposition"], 1000),
            impact: cleanText(proposition["impact"], 500),
          };
        })
      : [],
    hook_10s: cleanText(data["hook_10s"], 1000),
    microdrama_version: {
      episodes: Array.isArray(microdrama["episodes"])
        ? microdrama["episodes"].slice(0, 6).map((item) => {
            const episode = isRecord(item) ? item : {};
            return {
              title: cleanText(episode["title"], 200),
              summary: cleanText(episode["summary"], 800),
              cliffhanger: cleanText(episode["cliffhanger"], 300),
            };
          })
        : [],
    },
    budget_estimate: {
      tier: validateBudgetTier(budget["tier"]),
      breakdown: {
        decors: cleanText(budgetBreakdown["decors"], 500),
        personnages: cleanText(budgetBreakdown["personnages"], 500),
        jours_tournage: cleanText(budgetBreakdown["jours_tournage"], 200),
      },
      total_eur_range: validateBudgetRange(budget["total_eur_range"]),
    },
    hybridation_proposal: {
      genre_porte: cleanText(hybridation["genre_porte"], 200),
      theme_profond: cleanText(hybridation["theme_profond"], 500),
      exemple: cleanText(hybridation["exemple"], 1000),
    },
    format_recommendation: validateFormat(data["format_recommendation"]),
    format_reasoning: cleanText(data["format_reasoning"], 1500),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function pointArray(value: unknown): unknown[] {
  return isRecord(value) && Array.isArray(value["points"]) ? value["points"] : [];
}

function clipArray(arr: unknown[], maxLen: number, maxItemLen: number): string[] {
  return arr
    .slice(0, maxLen)
    .map((item) => cleanText(item, maxItemLen))
    .filter((item) => item.length > 0);
}

function clampScore(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 50;
}

function validateBudgetTier(value: unknown): LentilleBudgetTier {
  return value === "micro" || value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function validateBudgetRange(value: unknown): [number, number] {
  if (!Array.isArray(value) || value.length < 2) return [0, 0];
  const min = Math.max(0, Math.round(Number(value[0]) || 0));
  const max = Math.max(min, Math.round(Number(value[1]) || 0));
  return [min, max];
}

function validateFormat(value: unknown): LentilleRecommendation {
  const valid = ["film", "serie", "microdrama", "court", "poc", "multiplateforme"] as const;
  return valid.includes(value as LentilleRecommendation) ? (value as LentilleRecommendation) : "film";
}
