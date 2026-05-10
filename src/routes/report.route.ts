import { Hono } from "hono";
import { 
    createReport, 
    getReports,
    getReportById,
    updateReport, 
    deleteReport } 
    from "../controllers/report.controller";
import { verifyToken } from "../middlewares/verify";
import { ownerOnly } from "../middlewares/owner";

const reportRoute = new Hono()

reportRoute.get("/", getReports)
reportRoute.get("/:id", getReportById)
reportRoute.post("/", createReport, verifyToken)
reportRoute.patch("/:id", updateReport, verifyToken, ownerOnly)
reportRoute.delete("/:id", deleteReport, verifyToken, ownerOnly)

export default reportRoute