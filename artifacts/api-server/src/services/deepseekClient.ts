import OpenAI from "openai";

let client: OpenAI | null | undefined;

export class DeepSeekNotConfiguredError extends Error {
  constructor() {
    super("DEEPSEEK_NOT_CONFIGURED");
    this.name = "DeepSeekNotConfiguredError";
  }
}

export type DeepSeekUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export function getDeepSeekClient(): OpenAI | null {
  if (client !== undefined) return client;

  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) {
    client = null;
    return client;
  }

  client = new OpenAI({
    apiKey,
    baseURL: process.env["DEEPSEEK_BASE_URL"] ?? "https://api.deepseek.com",
  });
  return client;
}

export function getDeepSeekModel(): string {
  return process.env["DEEPSEEK_MODEL"] ?? "deepseek-chat";
}

export function computeDeepSeekCostEur(usage: DeepSeekUsage, model = "deepseek-chat"): number {
  const ratesUsdPerMillion: Record<string, { input: number; output: number }> = {
    "deepseek-chat": { input: 0.27, output: 1.10 },
    "deepseek-reasoner": { input: 0.55, output: 2.19 },
  };
  const rates = ratesUsdPerMillion[model] ?? ratesUsdPerMillion["deepseek-chat"];
  const usd =
    (usage.prompt_tokens / 1_000_000) * rates.input +
    (usage.completion_tokens / 1_000_000) * rates.output;
  return usd * 0.92;
}
