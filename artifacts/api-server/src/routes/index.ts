 
 
import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import projectsRouter from "./projects.js";
import skillsRouter from "./skills.js";
import researchLabRouter from "./researchLab.js";
import adminRouter from "./admin.js";
import authRouter from "./auth.js";
import adminDataRouter from "./adminData.js";
import manuscriptsRouter from "./manuscripts.js";
import memoryRouter from "./memory.js";
import experimentalModulesRouter from "./experimentalModules.js";
import workPassportRouter from "./workPassport.js";
import paymentRouter from "./payments.js";
import openTimestampsRouter from "./openTimestamps.js";
import publicVerifyRouter from "./publicVerify.js";
import exportsRouter from "./exports.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";
import accessRouter from "./access.js";
import { productAccessMiddleware } from "../lib/productAccess.js";
import { authContextMiddleware } from "../lib/auth.js";
import { aiModelContextMiddleware } from "../lib/aiConfig.js";
import { creativeMemoryContextMiddleware } from "../services/creativeMemoryContext.js";

const router: IRouter = Router();

// Public
router.use(healthRouter);
router.use(adminRouter);
router.use(authContextMiddleware);
router.use(authRouter);
router.use(accessRouter);
router.use(experimentalModulesRouter);
router.use(aiModelContextMiddleware);
router.use("/memory", memoryRouter);
router.use(paymentRouter);
router.use(openTimestampsRouter);
router.use(publicVerifyRouter);
router.use(exportsRouter);
router.use(creativeMemoryContextMiddleware);
router.use(productAccessMiddleware);
router.use(workPassportRouter);
router.use(projectsRouter);
router.use(manuscriptsRouter);

// Admin-protected
router.use(adminAuthMiddleware, skillsRouter);
router.use(adminAuthMiddleware, researchLabRouter);
router.use(adminAuthMiddleware, adminDataRouter);

export default router;
