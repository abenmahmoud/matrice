import { promises as fs } from "node:fs";
import path from "node:path";
import { and, desc, eq, isNull } from "drizzle-orm";
import { audioJobsTable, db, voiceSamplesTable } from "@workspace/db";

const MAX_SAMPLE_BYTES = 12 * 1024 * 1024;

function storageRoot(): string {
  return process.env["MATRICE_STORAGE_PATH"] ?? process.env["SIGN_STORAGE_PATH"] ?? "./storage";
}

export function isAudioGenerationEnabled(): boolean {
  return process.env["MATRICE_AUDIOBOOK_ENABLED"] === "true";
}

export function resolveAudioEngine(): "chatterbox" | "mock" {
  return isAudioGenerationEnabled() && process.env["CHATTERBOX_API_URL"] ? "chatterbox" : "mock";
}

export async function createVoiceSample(input: {
  userId: string;
  projectId?: string | null;
  displayName: string;
  consentText: string;
  consentAccepted: boolean;
  audioBase64: string;
  originalFilename?: string | null;
  mimeType?: string | null;
}) {
  if (!input.consentAccepted || input.consentText.trim().length < 30) throw new Error("CONSENT_REQUIRED");
  const buffer = Buffer.from(input.audioBase64, "base64");
  if (buffer.length < 100 || buffer.length > MAX_SAMPLE_BYTES) throw new Error("SAMPLE_SIZE_INVALID");
  const id = crypto.randomUUID();
  const safeExt = input.mimeType?.includes("mpeg") ? "mp3" : input.mimeType?.includes("ogg") ? "ogg" : "wav";
  const samplePath = path.join(storageRoot(), "voice-samples", input.userId, `${id}.${safeExt}`);
  await fs.mkdir(path.dirname(samplePath), { recursive: true });
  await fs.writeFile(samplePath, buffer);
  const [created] = await db.insert(voiceSamplesTable).values({
    id,
    userId: input.userId,
    projectId: input.projectId ?? null,
    displayName: input.displayName,
    consentText: input.consentText,
    consentAccepted: true,
    samplePath,
    originalFilename: input.originalFilename ?? null,
    mimeType: input.mimeType ?? "audio/wav",
    sizeBytes: buffer.length,
  }).returning();
  return created;
}

export async function deleteVoiceSample(userId: string, sampleId: string) {
  const [sample] = await db.select().from(voiceSamplesTable).where(and(eq(voiceSamplesTable.id, sampleId), eq(voiceSamplesTable.userId, userId), isNull(voiceSamplesTable.deletedAt))).limit(1);
  if (!sample) throw new Error("SAMPLE_NOT_FOUND");
  await fs.unlink(sample.samplePath).catch(() => undefined);
  await db.update(voiceSamplesTable).set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() }).where(eq(voiceSamplesTable.id, sample.id));
}

export async function listVoiceSamples(userId: string) {
  return db.select().from(voiceSamplesTable).where(and(eq(voiceSamplesTable.userId, userId), isNull(voiceSamplesTable.deletedAt))).orderBy(desc(voiceSamplesTable.createdAt));
}

export async function createAudioJob(input: {
  userId: string;
  projectId?: string | null;
  voiceSampleId?: string | null;
  scope: "excerpt" | "chapter" | "book";
  inputText: string;
}) {
  const engine = resolveAudioEngine();
  const jobId = crypto.randomUUID();
  const text = input.inputText.trim();
  if (text.length < 10 || text.length > 12000) throw new Error("TEXT_INVALID");
  if (input.voiceSampleId) {
    const [sample] = await db.select().from(voiceSamplesTable).where(and(eq(voiceSamplesTable.id, input.voiceSampleId), eq(voiceSamplesTable.userId, input.userId), isNull(voiceSamplesTable.deletedAt))).limit(1);
    if (!sample) throw new Error("SAMPLE_NOT_FOUND");
  }
  const [job] = await db.insert(audioJobsTable).values({
    id: jobId,
    userId: input.userId,
    projectId: input.projectId ?? null,
    voiceSampleId: input.voiceSampleId ?? null,
    scope: input.scope,
    status: engine === "mock" ? "completed" : "queued",
    engine,
    inputText: text,
    outputPath: engine === "mock" ? await writeMockAudio(jobId, text) : null,
    costCredits: engine === "mock" ? 0 : costForScope(input.scope),
    metadata: {
      license_check: "Chatterbox license must be verified for commercial use before live generation.",
      third_party_voice_cloning: "forbidden",
    },
    completedAt: engine === "mock" ? new Date() : null,
  }).returning();
  return job;
}

export async function listAudioJobs(userId: string) {
  return db.select().from(audioJobsTable).where(eq(audioJobsTable.userId, userId)).orderBy(desc(audioJobsTable.createdAt));
}

export async function getAudioJob(userId: string, jobId: string) {
  const [job] = await db.select().from(audioJobsTable).where(and(eq(audioJobsTable.id, jobId), eq(audioJobsTable.userId, userId))).limit(1);
  return job ?? null;
}

function costForScope(scope: string): number {
  if (scope === "book") return 500;
  if (scope === "chapter") return 80;
  return 10;
}

async function writeMockAudio(jobId: string, text: string): Promise<string> {
  const outputPath = path.join(storageRoot(), "audio-jobs", `${jobId}.txt`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `MOCK AUDIO\nWatermark: Generated with Matrice Voice Lab\n${text.slice(0, 2000)}`, "utf8");
  return outputPath;
}
