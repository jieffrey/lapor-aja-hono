import { Hono } from "hono";
import { 
    getUsers, 
    getUserById, 
    updateUserRole, 
    deleteUser 
}  from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verify";
import { checkRole } from "../middlewares/check";

const userRoute = new Hono()

userRoute.get("/", getUsers, verifyToken, checkRole(['superadmin']))
userRoute.get("/:id", getUserById, verifyToken, checkRole(['superadmin']))
userRoute.patch("/:id", updateUserRole, verifyToken, checkRole(['superadmin']))
userRoute.delete("/:id", deleteUser, verifyToken, checkRole(['superadmin']))

export default userRoute