import { Hono } from "hono";
import { 
    createReport, 
    getReports,
    getReportById,
    updateReport, 
    deleteReport 
} from "../controllers/report.controller";
import { verifyToken } from "../middlewares/verify";
import { ownerOnly } from "../middlewares/owner";

const reportRoute = new Hono()

reportRoute.get("/", getReports)
reportRoute.get("/:id", getReportById)
reportRoute.post("/", verifyToken, createReport )
reportRoute.patch("/:id", verifyToken, ownerOnly, updateReport)
reportRoute.delete("/:id", verifyToken, ownerOnly, deleteReport)

export default reportRoute