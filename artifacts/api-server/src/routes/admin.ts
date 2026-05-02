import { Router, type IRouter } from "express";
import { generateAdminToken } from "../middleware/adminAuth.js";

const router: IRouter = Router();

// POST /api/admin/login
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminPassword) {
    res.status(503).json({ error: "ADMIN_PASSWORD non configuré — définissez-le dans les secrets d'environnement" });
    return;
  }
  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Mot de passe incorrect" });
    return;
  }

  const token = generateAdminToken(password);
  res.json({ token });
});

// GET /api/admin/verify
router.get("/admin/verify", (req, res) => {
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) { res.status(503).json({ configured: false }); return; }

  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token) { res.status(401).json({ valid: false }); return; }

  const expected = generateAdminToken(adminPassword);
  res.json({ valid: token === expected });
});

export default router;
