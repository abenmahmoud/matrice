import { Router, type IRouter } from "express";
import { z } from "zod";
import { getAuthUser } from "../lib/auth.js";
import { getUserProgress, markStepCompleted, markStepSkipped, ONBOARDING_STEPS } from "../services/onboardingService.js";

const router: IRouter = Router();

router.get("/onboarding/progress", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const progress = await getUserProgress(user.id);
  res.json({ ...progress, all_steps: ONBOARDING_STEPS });
});

router.post("/onboarding/skip", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const input = z.object({ step_id: z.string().min(1) }).parse(req.body);
  await markStepSkipped(user.id, input.step_id);
  res.json({ ok: true });
});

router.post("/onboarding/complete", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return;
  }
  const input = z.object({ step_id: z.string().min(1), metadata: z.record(z.string(), z.unknown()).optional() }).parse(req.body);
  await markStepCompleted(user.id, input.step_id, input.metadata);
  res.json({ ok: true });
});

export default router;
