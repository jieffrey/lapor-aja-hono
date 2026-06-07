import { createMiddleware } from "hono/factory";
import pool from "../database/database";

export const ownerOnly = createMiddleware(async (c, next) => {
    try {
        const reportId = c.req.param("id");

        const payload = c.get("jwtPayload") as
            | { id?: number | string; role?: string }
            | undefined;

        // Only admin can bypass ownership check; superadmin can only view
        if (payload?.role === "admin") {
            return await next();
        }
        if (payload?.role === "superadmin") {
            return c.json({ success: false, message: "Forbidden Access" }, 403);
        }

        const result = await pool.query(`SELECT * FROM report WHERE id = $1 `, [
            reportId,
        ]);

        if (result.rows.length === 0) {
            return c.json(
                {
                    success: false,
                    message: "Report not found",
                },
                404,
            );
        }

        const report = result.rows[0];

        if (!payload || !payload.id) {
            return c.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                401,
            );
        }

        if (String(report.user_id) !== String(payload.id)) {
            return c.json(
                {
                    success: false,
                    message: "You are not owner",
                },
                403,
            );
        }

        await next();
    } catch (error) {
        return c.json(
            {
                success: false,
                message: "Middleware Error",
                error,
            },
            500,
        );
    }
});
