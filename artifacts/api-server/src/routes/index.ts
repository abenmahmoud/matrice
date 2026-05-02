import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects.js";
import skillsRouter from "./skills.js";
import researchLabRouter from "./researchLab.js";
import adminRouter from "./admin.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router: IRouter = Router();

// Public
router.use(healthRouter);
router.use(adminRouter);
router.use(projectsRouter);

// Admin-protected
router.use(adminAuthMiddleware, skillsRouter);
router.use(adminAuthMiddleware, researchLabRouter);

export default router;
