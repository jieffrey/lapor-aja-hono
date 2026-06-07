import { Hono } from "hono";
import { 
    getUsers, 
    getUserById, 
    updateUserRole,
    deleteUser ,
    getLeaderboard
}  from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verify";
import { checkRole } from "../middlewares/check";

const userRoute = new Hono()

userRoute.get("/", verifyToken, checkRole(['superadmin']), getUsers)
userRoute.get("/:id", verifyToken, checkRole(['superadmin']), getUserById)
userRoute.get("/leaderboard", verifyToken, getLeaderboard)
userRoute.patch("/:id", verifyToken, checkRole(['superadmin']), updateUserRole)
userRoute.delete("/:id", verifyToken, checkRole(['superadmin']), deleteUser)

export default userRoute