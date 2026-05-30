import { Router, type IRouter, type Request, type Response } from "express";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import { getBalance, getHistory } from "../services/creditsService.js";

const router: IRouter = Router();

function requireUser(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

// GET /api/credits/balance — solde courant (mensuel + acheté + total)
router.get("/credits/balance", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const balance = await getBalance(user.id);
    res.json({ balance });
  } catch (err) {
    req.log.error({ err }, "Erreur lecture solde credits");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/credits/history — derniers mouvements de crédits
router.get("/credits/history", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const history = await getHistory(user.id);
    res.json({ history });
  } catch (err) {
    req.log.error({ err }, "Erreur historique credits");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
