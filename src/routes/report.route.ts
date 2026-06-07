import { Hono } from "hono";
import { 
    createReport, 
    getReports,
    getReportById,
    updateReport, 
    deleteReport, 
    updateReportStatus
} from "../controllers/report.controller";
import { verifyToken } from "../middlewares/verify";
import { ownerOnly } from "../middlewares/owner";
import { checkRole } from "../middlewares/check";

const reportRoute = new Hono()

reportRoute.get("/", getReports)
reportRoute.get("/:id", getReportById)
reportRoute.post("/", verifyToken, createReport )
// reportRoute.patch("/:id", verifyToken, ownerOnly, updateReport)
reportRoute.patch("/:id",
    verifyToken,
    ownerOnly, updateReport)
reportRoute.patch(
  "/:id/status",
  verifyToken,
  async (c, next) => {
    console.log("AFTER VERIFY:", (c as any).get("jwtPayload"))
    await next()
  },
  checkRole(["admin"]),
  updateReportStatus
)
reportRoute.delete("/:id", verifyToken, ownerOnly, deleteReport)

export default reportRoute