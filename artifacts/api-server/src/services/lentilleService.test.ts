import test from "node:test";
import assert from "node:assert/strict";
import { computeDeepSeekCostEur } from "./deepseekClient.js";
import { sanitizeResult } from "./lentilleService.js";

test("sanitizeResult borne les scores et normalise les valeurs enum", () => {
  const result = sanitizeResult({
    scores: {
      microdrama: 140,
      ai_prod: -20,
      pression_spatiale: 52.4,
      perso_deplace: "not-a-number",
      hybridation: 88.8,
      global: 101,
    },
    diagnostic_compatible: { points: ["A", "B", "C", "D", "E", "F", "G"] },
    diagnostic_renforcer: { points: ["Point utile"] },
    propositions: [{ axe: "microdrama", proposition: "Action concrete", impact: "Impact clair" }],
    hook_10s: "Hook",
    microdrama_version: { episodes: [{ title: "Ep 1", summary: "Resume", cliffhanger: "Cliff" }] },
    budget_estimate: {
      tier: "unknown",
      breakdown: { decors: "Un lieu", personnages: "Deux roles", jours_tournage: "5 jours" },
      total_eur_range: [-1, 12_500.3],
    },
    hybridation_proposal: { genre_porte: "Thriller", theme_profond: "Deuil", exemple: "Scene" },
    format_recommendation: "invalid",
    format_reasoning: "Raison",
  });

  assert.equal(result.scores.microdrama, 100);
  assert.equal(result.scores.ai_prod, 0);
  assert.equal(result.scores.pression_spatiale, 52);
  assert.equal(result.scores.perso_deplace, 50);
  assert.equal(result.scores.hybridation, 89);
  assert.equal(result.scores.global, 100);
  assert.equal(result.diagnostic_compatible.points.length, 6);
  assert.equal(result.budget_estimate.tier, "medium");
  assert.deepEqual(result.budget_estimate.total_eur_range, [0, 12500]);
  assert.equal(result.format_recommendation, "film");
});

test("computeDeepSeekCostEur calcule un cout inferieur au centime pour une analyse standard", () => {
  const cost = computeDeepSeekCostEur({ prompt_tokens: 3_000, completion_tokens: 2_000, total_tokens: 5_000 });

  assert.ok(cost > 0);
  assert.ok(cost < 0.01);
});
