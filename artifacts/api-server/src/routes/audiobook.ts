import { Router, type IRouter, type Request, type Response } from "express";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import {
  createAudioJob,
  createVoiceSample,
  deleteVoiceSample,
  getAudioJob,
  isAudioGenerationEnabled,
  listAudioJobs,
  listVoiceSamples,
  resolveAudioEngine,
} from "../services/audiobookService.js";

const router: IRouter = Router();

function requireUser(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

router.get("/voice-lab/status", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json({
    engine: resolveAudioEngine(),
    generation_enabled: isAudioGenerationEnabled(),
    license_notice: "Verifier la licence Chatterbox pour usage commercial avant activation live.",
    safeguards: ["consentement explicite", "watermark", "pas de clonage de voix tierce", "suppression sample RGPD"],
  });
});

router.get("/voice-lab/samples", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    res.json({ samples: await listVoiceSamples(user.id) });
  } catch (err) {
    req.log.error({ err }, "Erreur liste samples voix");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/voice-lab/samples", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    const sample = await createVoiceSample({
      userId: user.id,
      projectId: typeof req.body?.project_id === "string" ? req.body.project_id : null,
      displayName: typeof req.body?.display_name === "string" ? req.body.display_name.trim() : "Voix auteur",
      consentText: typeof req.body?.consent_text === "string" ? req.body.consent_text.trim() : "",
      consentAccepted: req.body?.consent_accepted === true,
      audioBase64: typeof req.body?.audio_base64 === "string" ? req.body.audio_base64 : "",
      originalFilename: typeof req.body?.filename === "string" ? req.body.filename : null,
      mimeType: typeof req.body?.mime_type === "string" ? req.body.mime_type : null,
    });
    res.status(201).json({ sample });
  } catch (err) {
    req.log.error({ err }, "Erreur upload sample voix");
    res.status(400).json({ error: err instanceof Error ? err.message : "SAMPLE_INVALID" });
  }
});

router.delete("/voice-lab/samples/:id", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    await deleteVoiceSample(user.id, req.params["id"] ?? "");
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Erreur suppression sample voix");
    res.status(err instanceof Error && err.message === "SAMPLE_NOT_FOUND" ? 404 : 500).json({ error: err instanceof Error ? err.message : "Erreur serveur" });
  }
});

router.get("/voice-lab/jobs", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    res.json({ jobs: await listAudioJobs(user.id) });
  } catch (err) {
    req.log.error({ err }, "Erreur jobs audio");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/voice-lab/jobs", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    const scope = req.body?.scope === "chapter" || req.body?.scope === "book" ? req.body.scope : "excerpt";
    const job = await createAudioJob({
      userId: user.id,
      projectId: typeof req.body?.project_id === "string" ? req.body.project_id : null,
      voiceSampleId: typeof req.body?.voice_sample_id === "string" && req.body.voice_sample_id ? req.body.voice_sample_id : null,
      scope,
      inputText: typeof req.body?.input_text === "string" ? req.body.input_text : "",
    });
    res.status(201).json({ job });
  } catch (err) {
    req.log.error({ err }, "Erreur creation job audio");
    res.status(400).json({ error: err instanceof Error ? err.message : "JOB_INVALID" });
  }
});

router.get("/voice-lab/jobs/:id", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const job = await getAudioJob(user.id, req.params["id"] ?? "");
  if (!job) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  res.json({ job });
});

export default router;
