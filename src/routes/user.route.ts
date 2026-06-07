import { Hono } from "hono";
import { 
    getUsers, 
    getUserById, 
    updateUserRole,
    deleteUser ,
    getLeaderboard,
    updateUserProfile
}  from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verify";
import { checkRole } from "../middlewares/check";

const userRoute = new Hono()

// Public (with token) — must be BEFORE /:id or it'll match "leaderboard" as an id
userRoute.get("/leaderboard", verifyToken, getLeaderboard)

// Superadmin & admin only
userRoute.get("/", verifyToken, checkRole(['superadmin', 'admin']), getUsers)

// Superadmin & admin, or the user themselves
userRoute.get("/:id", verifyToken, async (c, next) => {
    const payload = c.get("jwtPayload") as { id: number; role: string } | undefined
    const targetId = c.req.param("id")

    if (
        payload?.role === "superadmin" ||
        payload?.role === "admin" ||
        String(payload?.id) === targetId
    ) {
        await next()
    } else {
        return c.json({ success: false, message: "Forbidden Access" }, 403)
    }
}, getUserById)

// Update profile (name) — user themselves or superadmin
userRoute.patch("/profile/:id", verifyToken, updateUserProfile)

// Update role — superadmin only
userRoute.patch("/:id", verifyToken, checkRole(['superadmin']), updateUserRole)
userRoute.delete("/:id", verifyToken, checkRole(['superadmin']), deleteUser)

export default userRoute
