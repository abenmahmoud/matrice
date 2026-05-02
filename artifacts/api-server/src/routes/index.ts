import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects.js";
import skillsRouter from "./skills.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillsRouter);
router.use(projectsRouter);

export default router;
