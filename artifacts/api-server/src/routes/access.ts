import { Router, type IRouter } from "express";
import { getProductAccess } from "../lib/productAccess.js";

const router: IRouter = Router();

router.get("/access", (_req, res) => {
  res.json(getProductAccess());
});

export default router;
