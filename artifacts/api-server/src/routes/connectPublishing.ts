import { Router, type IRouter, type Request, type Response } from "express";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import {
  createDestinationCheckout,
  createPayoutOnboardingLink,
  getPayoutStatus,
  listPublishingFinance,
  upsertChannelConnection,
} from "../services/connectPublishingService.js";

const router: IRouter = Router();

function requireUser(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

router.get("/connect/payout-account", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    res.json(await getPayoutStatus(user.id));
  } catch (err) {
    req.log.error({ err }, "Erreur statut Stripe Connect");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/connect/payout-account/onboarding", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    const result = await createPayoutOnboardingLink(user.id, user.email);
    res.status(201).json({ account: result.account, url: result.url });
  } catch (err) {
    req.log.error({ err }, "Erreur onboarding Stripe Connect");
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(message === "CONNECT_LIVE_DISABLED" ? 423 : 500).json({ error: message });
  }
});

router.get("/projects/:id/publishing/finance", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    res.json(await listPublishingFinance(user.id, req.params["id"] ?? ""));
  } catch (err) {
    req.log.error({ err }, "Erreur finance publication");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/projects/:id/publishing/channels", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    const channel = typeof req.body?.channel === "string" ? req.body.channel.trim() : "";
    if (channel.length < 2 || channel.length > 120) {
      res.status(400).json({ error: "CHANNEL_INVALID" });
      return;
    }
    const connection = await upsertChannelConnection({
      userId: user.id,
      projectId: req.params["id"] ?? "",
      channel,
      externalAccount: typeof req.body?.external_account === "string" ? req.body.external_account.trim() : undefined,
      status: typeof req.body?.status === "string" ? req.body.status.trim() : "planned",
    });
    res.status(201).json({ connection });
  } catch (err) {
    req.log.error({ err }, "Erreur canal publication");
    res.status(err instanceof Error && err.message === "PROJECT_NOT_FOUND" ? 404 : 500).json({ error: err instanceof Error ? err.message : "Erreur serveur" });
  }
});

router.post("/projects/:id/publishing/connect-checkout", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;
    const amount = Number(req.body?.amount_cents);
    const channel = typeof req.body?.channel === "string" ? req.body.channel.trim() : "Matrice";
    const currency = typeof req.body?.currency === "string" ? req.body.currency.trim().toUpperCase() : "EUR";
    if (!Number.isInteger(amount) || amount < 100 || amount > 1000000) {
      res.status(400).json({ error: "AMOUNT_INVALID" });
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      res.status(400).json({ error: "CURRENCY_INVALID" });
      return;
    }
    const result = await createDestinationCheckout({ userId: user.id, email: user.email, projectId: req.params["id"] ?? "", channel, amountCents: amount, currency });
    res.status(201).json({ session_id: result.session.id, url: result.session.url, settlement: result.settlement });
  } catch (err) {
    req.log.error({ err }, "Erreur checkout Connect");
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "KYC_INCOMPLETE" ? 409 : message === "CONNECT_LIVE_DISABLED" ? 423 : message === "PROJECT_NOT_FOUND" ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
