import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";
import { db, creativeMemoryEntriesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { getProductAccess } from "../lib/productAccess.js";

type MemoryStore = {
  context: string;
};

const memoryStore = new AsyncLocalStorage<MemoryStore>();

const CATEGORY_LABELS: Record<string, string> = {
  creative_rules: "Regles creatives",
  narrative_bans: "Interdits narratifs",
  references: "References fortes",
  motifs: "Motifs recurrents",
  quality_criteria: "Criteres qualite",
  art_direction: "Direction artistique",
};

function shouldLoadMemory(req: Request): boolean {
  if (req.method !== "POST") return false;

  const path = req.path;
  return (
    path === "/manuscripts/analyze" ||
    /^\/projects\/[^/]+\/generate-[^/]+$/.test(path) ||
    /^\/projects\/[^/]+\/director-mode$/.test(path) ||
    /^\/projects\/[^/]+\/characters\/[^/]+\/dialogue$/.test(path) ||
    /^\/projects\/[^/]+\/check-scene-hpsa$/.test(path) ||
    /^\/projects\/[^/]+\/screenplay\/beats\/[^/]+\/generate-fountain$/.test(path)
  );
}

function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

async function buildCreativeMemoryContext(): Promise<string> {
  const entries = await db
    .select()
    .from(creativeMemoryEntriesTable)
    .where(eq(creativeMemoryEntriesTable.isActive, true))
    .orderBy(desc(creativeMemoryEntriesTable.priority), desc(creativeMemoryEntriesTable.updatedAt))
    .limit(12);

  if (entries.length === 0) return "";

  const lines = entries.map((entry, index) => {
    const label = CATEGORY_LABELS[entry.category] ?? entry.category;
    const tags = entry.tags.length ? ` | tags: ${entry.tags.join(", ")}` : "";
    const content = clamp(entry.content, 700);
    return `${index + 1}. [${label}] ${entry.title} (priorite ${entry.priority}${tags})\n${content}`;
  });

  return [
    "### MEMOIRE CREATIVE PRIVEE DU CREATEUR",
    "Ces notes expriment les preferences, interdits, criteres qualite et references personnelles du proprietaire de Matrice.",
    "Respecte-les comme des contraintes de direction artistique. Si une note contredit une instruction utilisateur explicite dans cette requete, privilegie l'instruction utilisateur immediate, puis signale la tension dans la reponse quand c'est utile.",
    "",
    ...lines,
  ].join("\n");
}

export function getCurrentCreativeMemoryContext(): string {
  return memoryStore.getStore()?.context ?? "";
}

export function appendCreativeMemoryContext(systemPrompt: string): string {
  const context = getCurrentCreativeMemoryContext();
  return context ? `${systemPrompt}\n\n${context}` : systemPrompt;
}

export async function creativeMemoryContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  void res;

  if (!shouldLoadMemory(req)) {
    memoryStore.run({ context: "" }, next);
    return;
  }

  try {
    const access = getProductAccess(req);
    const context = access.viewer.role === "owner" ? await buildCreativeMemoryContext() : "";
    memoryStore.run({ context }, next);
  } catch (err) {
    req.log?.warn?.({ err }, "Failed to load creative memory context");
    memoryStore.run({ context: "" }, next);
  }
}
