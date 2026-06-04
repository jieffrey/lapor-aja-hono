import { createMiddleware } from "hono/factory"
import * as Jwt from "jsonwebtoken"

export const verifyToken = createMiddleware(async (c, next) => {
  try {
    const auth = c.req.header("Authorization")

    console.log("AUTH:", auth)

    if (!auth?.startsWith("Bearer ")) {
      return c.json(
        {
          success: false,
          message: "Unauthorized"
        },
        401
      )
    }

    const token = auth.substring(7)

    const payload = Jwt.verify(
      token,
      process.env.JWT_SECRET as string
    )

    console.log("PAYLOAD:", payload)

    c.set("jwtPayload", payload)

    await next()
  } catch (err) {
    console.error("VERIFY ERROR:", err)

    return c.json(
      {
        success: false,
        message: "Invalid Token"
      },
      401
    )
  }
})