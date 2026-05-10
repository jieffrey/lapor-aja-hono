import { createMiddleware } from "hono/factory"

interface JWTPayload {
    role: string;
}

export const checkRole = (
    roles: string[]
) => {
    return createMiddleware(
        async (c, next) => {
            const payload = c.get("jwtPayload") as JWTPayload | undefined

            if (!payload || typeof payload.role !== "string" || !roles.includes(payload.role)) {
                return c.json(
                    {
                        success: false,
                        message: "Forbidden Access",
                    },
                    403
                )
            }

            await next()
        }
    )
}