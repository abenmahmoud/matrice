import { createHmac } from "crypto";
import type { Request, Response, NextFunction } from "express";

export function generateAdminToken(password: string): string {
  const secret = process.env["SESSION_SECRET"] ?? "matrice-secret";
  return createHmac("sha256", secret).update(password).digest("hex");
}

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    res.status(503).json({ error: "ADMIN_PASSWORD non configuré" });
    return;
  }
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Token admin requis" });
    return;
  }
  const expected = generateAdminToken(adminPassword);
  if (token !== expected) {
    res.status(401).json({ error: "Token invalide" });
    return;
  }
  next();
}
