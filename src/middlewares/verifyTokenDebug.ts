import { createMiddleware } from "hono/factory"

export const verifyTokenDebug = createMiddleware(async (c, next) => {
  console.log("HEADERS:", Object.fromEntries(c.req.raw.headers.entries()))
  console.log("AUTH:", c.req.header("Authorization"))

  await next()
})