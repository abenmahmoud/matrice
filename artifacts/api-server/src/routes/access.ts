import { Router, type IRouter } from "express";
import { getProductAccess, serializeProductAccessForClient } from "../lib/productAccess.js";

const router: IRouter = Router();

router.get("/access", (req, res) => {
  res.json(serializeProductAccessForClient(getProductAccess(req)));
});

export default router;
