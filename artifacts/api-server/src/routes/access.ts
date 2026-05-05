import { Router, type IRouter } from "express";
import { getProductAccess } from "../lib/productAccess.js";

const router: IRouter = Router();

router.get("/access", (req, res) => {
  res.json(getProductAccess(req));
});

export default router;
