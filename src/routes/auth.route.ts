import { Hono } from "hono";
import { login, register, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verify";
import { getMe } from "../controllers/auth.controller";

const authRoute = new Hono()

authRoute.post("/register", register)
authRoute.post("/login", login)
authRoute.post("/forgot-password", forgotPassword)
authRoute.post("/reset-password", resetPassword)
authRoute.get("/me", verifyToken, getMe)

export default authRoute
