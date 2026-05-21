import { Router, type IRouter, type Request, type Response } from "express";
import { stripe, createCheckoutSession, createCustomerPortalSession, getUserSubscription, cancelSubscription, reactivateSubscription, getUserInvoices, handleWebhookEvent } from "../services/stripeService.js";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";

const router: IRouter = Router();
const BILLING_PLANS = new Set(["pro", "studio", "publish"]);

function requireUser(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "Authentification requise" });
    return null;
  }
  return user;
}

function isBillingPlan(value: unknown): value is "pro" | "studio" | "publish" {
  return typeof value === "string" && BILLING_PLANS.has(value);
}

// POST /api/payments/checkout — Creer session Stripe Checkout
router.post("/payments/checkout", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const { plan } = req.body;
    if (!isBillingPlan(plan)) {
      res.status(400).json({ error: "Plan invalide. Choisissez pro, studio ou publish." });
      return;
    }

    const session = await createCheckoutSession(user.id, user.email, plan);
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    req.log.error({ err }, "Erreur checkout");
    res.status(500).json({ error: "Erreur lors de la creation du paiement" });
  }
});

// GET /api/payments/subscription — Lire abonnement actuel
router.get("/payments/subscription", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const sub = await getUserSubscription(user.id);
    res.json({ subscription: sub });
  } catch (err) {
    req.log.error({ err }, "Erreur lecture abonnement");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/payments/cancel — Annuler abonnement
router.post("/payments/cancel", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const result = await cancelSubscription(user.id);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Erreur annulation");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/payments/reactivate — Reactiver abonnement
router.post("/payments/reactivate", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const result = await reactivateSubscription(user.id);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Erreur reactivation");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/payments/portal — Redirection vers Customer Portal Stripe
router.get("/payments/portal", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const url = await createCustomerPortalSession(user.id);
    res.json({ url });
  } catch (err) {
    req.log.error({ err }, "Erreur portal");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/payments/invoices — Lister factures
router.get("/payments/invoices", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const invoices = await getUserInvoices(user.id);
    res.json({ invoices });
  } catch (err) {
    req.log.error({ err }, "Erreur factures");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/payments/webhook — Ecouter evenements Stripe
router.post("/payments/webhook", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const secret = process.env["STRIPE_WEBHOOK_SECRET"];

    if (!sig || !secret) {
      res.status(400).json({ error: "Signature ou secret manquant" });
      return;
    }
    if (!stripe) {
      res.status(503).json({ error: "Stripe non configure" });
      return;
    }
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: "Corps webhook brut manquant" });
      return;
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      secret
    );

    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).json({ error: "Webhook invalide" });
  }
});

export default router;
