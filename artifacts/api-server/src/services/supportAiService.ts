import { db, supportFaqTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getDeepSeekClient, getDeepSeekModel } from "./deepseekClient.js";

export interface FaqSuggestion {
  faqId: string;
  question: string;
  answer: string;
  confidence: number;
}

function stripJsonFence(content: string): string {
  return content.replace(/```json|```/g, "").trim();
}

export async function suggestFaqAnswer(question: string, category: string): Promise<FaqSuggestion | null> {
  const client = getDeepSeekClient();
  if (!client) return null;

  const faqs = await db.select().from(supportFaqTable).where(eq(supportFaqTable.category, category)).limit(20);
  if (faqs.length === 0) return null;

  const prompt = `Question utilisateur:

"""
${question}
"""

FAQ disponibles (${category}):

${faqs.map((faq, index) => `[${index}] Q: ${faq.question}\nR: ${faq.answer}`).join("\n\n")}

Reponds en JSON strict:
{
  "best_match_index": <number 0-${faqs.length - 1}> | null,
  "confidence": <number 0-1>,
  "reasoning": "<court>"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: getDeepSeekModel(),
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 220,
      messages: [
        { role: "system", content: "Tu aides le support Matrice a rapprocher une question d'une FAQ. Reponds seulement en JSON." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(stripJsonFence(raw)) as { best_match_index: number | null; confidence: number };
    if (parsed.best_match_index === null || !Number.isFinite(parsed.confidence) || parsed.confidence < 0.75) return null;

    const faq = faqs[parsed.best_match_index];
    if (!faq) return null;
    await db.update(supportFaqTable).set({ usesCount: sql`${supportFaqTable.usesCount} + 1` }).where(eq(supportFaqTable.id, faq.id));
    return { faqId: faq.id, question: faq.question, answer: faq.answer, confidence: parsed.confidence };
  } catch {
    return null;
  }
}
