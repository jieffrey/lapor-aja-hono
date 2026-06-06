import { Hono } from "hono"
import { verifyToken } from "../middlewares/verify"
import {
    getMyNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
} from "../controllers/notification.controller"

const notificationRoute = new Hono()

notificationRoute.use("/*", verifyToken)
notificationRoute.get("/", getMyNotifications)
notificationRoute.get("/unread-count", getUnreadCount)
notificationRoute.patch("/read-all", markAllNotificationsRead)
notificationRoute.patch("/:id/read", markNotificationRead)

export default notificationRoute