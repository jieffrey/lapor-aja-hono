import { Context } from "hono"
import {
    getNotificationsByUserService,
    getUnreadCountService,
    markAsReadService,
    markAllAsReadService,
} from "../services/notification.service"

export const getMyNotifications = async (c: Context) => {
    try {
        const payload = c.get("jwtPayload") as { id: number }
        const notifications = await getNotificationsByUserService(payload.id)

        return c.json({
            success: true,
            data: notifications,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return c.json(
            { success: false, message: "Failed to get notifications", error: message },
            500
        )
    }
}

export const getUnreadCount = async (c: Context) => {
    try {
        const payload = c.get("jwtPayload") as { id: number }
        const count = await getUnreadCountService(payload.id)

        return c.json({
            success: true,
            data: { count },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return c.json(
            { success: false, message: "Failed to get unread count", error: message },
            500
        )
    }
}

export const markNotificationRead = async (c: Context) => {
    try {
        const payload = c.get("jwtPayload") as { id: number }
        const id = c.req.param("id")

        if (!id) {
            return c.json({ success: false, message: "Missing id parameter" }, 400)
        }

        const notification = await markAsReadService(Number(id), payload.id)

        if (!notification) {
            return c.json({ success: false, message: "Notification not found" }, 404)
        }

        return c.json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return c.json(
            { success: false, message: "Failed to mark as read", error: message },
            500
        )
    }
}

export const markAllNotificationsRead = async (c: Context) => {
    try {
        const payload = c.get("jwtPayload") as { id: number }
        await markAllAsReadService(payload.id)

        return c.json({
            success: true,
            message: "All notifications marked as read",
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return c.json(
            { success: false, message: "Failed to mark all as read", error: message },
            500
        )
    }
}