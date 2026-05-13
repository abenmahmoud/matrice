import { Router, type IRouter } from "express";
import { stripe, createCheckoutSession, createCustomerPortalSession, getUserSubscription, cancelSubscription, reactivateSubscription, getUserInvoices, handleWebhookEvent } from "../services/stripeService.js";
import { getProductAccess } from "../lib/productAccess.js";
import type { AuthenticatedRequest } from "../lib/auth.js";

const router: IRouter = Router();

// POST /api/payments/checkout — Creer session Stripe Checkout
router.post("/payments/checkout", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const { plan } = req.body;
    if (!plan || !["pro", "studio", "publish"].includes(plan)) {
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
router.get("/payments/subscription", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const sub = await getUserSubscription(userId);
    res.json({ subscription: sub });
  } catch (err) {
    req.log.error({ err }, "Erreur lecture abonnement");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/payments/cancel — Annuler abonnement
router.post("/payments/cancel", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const result = await cancelSubscription(userId);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Erreur annulation");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/payments/reactivate — Reactiver abonnement
router.post("/payments/reactivate", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const result = await reactivateSubscription(userId);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Erreur reactivation");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/payments/portal — Redirection vers Customer Portal Stripe
router.get("/payments/portal", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const url = await createCustomerPortalSession(userId);
    res.json({ url });
  } catch (err) {
    req.log.error({ err }, "Erreur portal");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/payments/invoices — Lister factures
router.get("/payments/invoices", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const invoices = await getUserInvoices(userId);
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

    const event = stripe.webhooks.constructEvent(
      req.body as string | Buffer,
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
