import { Hono } from "hono";
import { verifyToken } from "../middlewares/verify";
import { categorizeReport } from "../controllers/ai.controller";

const aiRoute = new Hono();

aiRoute.post("/categorize", verifyToken, categorizeReport);

export default aiRoute;
