/**
 * Skills Injection Service
 * Fetches active AI skills and cinema knowledge from DB,
 * formats them as contextual knowledge blocks for prompt injection.
 */

import { db } from "@workspace/db";
import { aiSkillsTable, cinemaKnowledgeTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

export type InjectionContext =
  | "roman"
  | "scenario"
  | "pitch"
  | "note-intention"
  | "all";

export interface InjectedSkillsContext {
  skillsBlock: string;
  cinemaBlock: string;
  combined: string;
}

/**
 * Fetch top active skills for a given context and format them for prompt injection.
 */
export async function buildSkillsContext(
  context: InjectionContext,
  opts: {
    maxSkills?: number;
    genre?: string;
    format?: string;
    cinemaReferences?: string;
  } = {}
): Promise<InjectedSkillsContext> {
  const { maxSkills = 3, cinemaReferences = "" } = opts;

  try {
    // Fetch active skills matching this context or 'all'
    const allSkills = await db
      .select()
      .from(aiSkillsTable)
      .where(eq(aiSkillsTable.isActive, true))
      .orderBy(desc(aiSkillsTable.priority));

    const relevant = allSkills.filter((s) => {
      const ctxs = s.injectionContexts as string[];
      return ctxs.includes(context) || ctxs.includes("all");
    });

    const top = relevant.slice(0, maxSkills);

    // Increment usage count for selected skills (fire-and-forget)
    if (top.length > 0) {
      void Promise.all(
        top.map((s) =>
          db
            .update(aiSkillsTable)
            .set({ usageCount: sql`${aiSkillsTable.usageCount} + 1` })
            .where(eq(aiSkillsTable.id, s.id))
        )
      );
    }

    // Build skills block
    const skillsBlock =
      top.length > 0
        ? `### SAVOIR NARRATIF ACTIF (${top.length} skills) :\n` +
          top
            .map((s) => `**${s.name}** [${s.category}]\n${s.content}`)
            .join("\n\n")
        : "";

    // Fetch cinema knowledge — match against user's cinematic references if provided
    const allCinema = await db
      .select()
      .from(cinemaKnowledgeTable)
      .where(eq(cinemaKnowledgeTable.isActive, true))
      .orderBy(cinemaKnowledgeTable.region);

    let cinemaEntries = allCinema;

    // If user mentioned specific references, prioritize matching entries
    if (cinemaReferences.trim()) {
      const refLower = cinemaReferences.toLowerCase();
      const matched = allCinema.filter(
        (c) =>
          refLower.includes(c.director.toLowerCase()) ||
          refLower.includes(c.movement.toLowerCase()) ||
          refLower.includes(c.country.toLowerCase()) ||
          (c.tags as string[]).some((t) => refLower.includes(t.toLowerCase()))
      );
      // Take matched first, then fill up to 2 entries
      cinemaEntries = [
        ...matched.slice(0, 2),
        ...allCinema
          .filter((c) => !matched.includes(c))
          .slice(0, Math.max(0, 2 - matched.length)),
      ];
    } else {
      // Pick 2 random active entries for variety
      const shuffled = [...allCinema].sort(() => Math.random() - 0.5);
      cinemaEntries = shuffled.slice(0, 2);
    }

    const cinemaBlock =
      cinemaEntries.length > 0
        ? `### RÉFÉRENCES CINÉMA MONDIAL :\n` +
          cinemaEntries
            .map(
              (c) =>
                `**${c.director || c.movement}** (${c.country}, ${c.era}${c.movement ? ` — ${c.movement}` : ""})\n` +
                `Signatures narratives : ${c.narrativeSignatures}\n` +
                (c.techniques.length > 0
                  ? `Techniques : ${(c.techniques as string[]).join(", ")}`
                  : "")
            )
            .join("\n\n")
        : "";

    const combined =
      [skillsBlock, cinemaBlock].filter(Boolean).join("\n\n") || "";

    return { skillsBlock, cinemaBlock, combined };
  } catch {
    // Fail silently — skills injection is enhancement, not required
    return { skillsBlock: "", cinemaBlock: "", combined: "" };
  }
}

/**
 * Quick accessor — returns just the combined string for prompt injection.
 */
export async function getSkillsContextString(
  context: InjectionContext,
  opts?: Parameters<typeof buildSkillsContext>[1]
): Promise<string> {
  const result = await buildSkillsContext(context, opts);
  return result.combined;
}
