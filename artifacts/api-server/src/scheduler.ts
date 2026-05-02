import { db } from "@workspace/db";
import { researchEntriesTable, narrativeSkillsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateResearchEntry, selectDailyTarget, ERAS, CULTURES } from "./services/researchLabService.js";
import { logger } from "./lib/logger.js";

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function runDailyResearch(): Promise<void> {
  logger.info("Scheduler: démarrage de la recherche quotidienne autonome");
  try {
    const existing = await db.select({
      era: researchEntriesTable.era,
      culture: researchEntriesTable.culture,
    }).from(researchEntriesTable);

    const target = selectDailyTarget(existing);
    const eraObj = ERAS.find(e => e.key === target.era);
    const cultureObj = CULTURES.find(c => c.key === target.culture);

    logger.info({ era: target.era, culture: target.culture, medium: target.medium },
      "Scheduler: génération en cours");

    const data = await generateResearchEntry(target.era, target.culture, target.medium);

    const [entry] = await db.insert(researchEntriesTable).values({
      title: data.title,
      era: target.era,
      eraLabel: eraObj?.label ?? target.era,
      eraStart: eraObj?.start,
      eraEnd: eraObj?.end,
      culture: target.culture,
      cultureLabel: cultureObj?.label ?? target.culture,
      medium: target.medium,
      summary: data.summary,
      keyTechniques: data.keyTechniques,
      emotionalPrinciples: data.emotionalPrinciples,
      culturalContext: data.culturalContext,
      notableWorks: data.notableWorks,
      narrativeLessons: data.narrativeLessons,
      skillsExtracted: data.extractedSkills.length > 0,
      extractedSkillIds: [],
    }).returning();

    const skillIds: string[] = [];
    for (const sk of data.extractedSkills) {
      const [saved] = await db.insert(narrativeSkillsTable).values({
        name: sk.name,
        description: sk.description,
        category: sk.category,
        promptContent: sk.promptContent,
        isActive: false,
        isGlobal: true,
      }).returning();
      skillIds.push(saved.id);
    }

    if (skillIds.length > 0) {
      await db.update(researchEntriesTable)
        .set({ extractedSkillIds: skillIds })
        .where(eq(researchEntriesTable.id, entry.id));
    }

    logger.info({ entryId: entry.id, skills: skillIds.length },
      "Scheduler: recherche quotidienne terminée");
  } catch (err) {
    logger.error({ err }, "Scheduler: erreur lors de la recherche quotidienne");
  }
}

export function startDailyResearchScheduler(): void {
  logger.info("Scheduler: démarrage du cron quotidien (toutes les 24h)");

  // Run immediately at startup to check if we need today's research
  void (async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entries = await db.select().from(researchEntriesTable);
      const todayEntry = entries.find(e => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      if (!todayEntry) {
        logger.info("Scheduler: pas de recherche aujourd'hui, lancement immédiat");
        await runDailyResearch();
      } else {
        logger.info("Scheduler: recherche déjà effectuée aujourd'hui, prochaine dans 24h");
      }
    } catch (err) {
      logger.error({ err }, "Scheduler: vérification initiale échouée");
    }
  })();

  // Then every 24h
  setInterval(() => { void runDailyResearch(); }, INTERVAL_MS);
}
