import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) => {
  return c.text("LaporAja API Running")
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch
}