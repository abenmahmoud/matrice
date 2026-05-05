import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects.js";
import skillsRouter from "./skills.js";
import researchLabRouter from "./researchLab.js";
import adminRouter from "./admin.js";
import adminDataRouter from "./adminData.js";
import manuscriptsRouter from "./manuscripts.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";
import accessRouter from "./access.js";
import { productAccessMiddleware } from "../lib/productAccess.js";

const router: IRouter = Router();

// Public
router.use(healthRouter);
router.use(adminRouter);
router.use(accessRouter);
router.use(productAccessMiddleware);
router.use(projectsRouter);
router.use(manuscriptsRouter);

// Admin-protected
router.use(adminAuthMiddleware, skillsRouter);
router.use(adminAuthMiddleware, researchLabRouter);
router.use(adminAuthMiddleware, adminDataRouter);

export default router;
