import { Hono } from "hono"
import authRoute from './routes/auth.route';
import reportRoute from "./routes/report.route";
import commmentRoute from "./routes/comment.route";

const app = new Hono()

app.get("/", (c) => {
  return c.text("LaporAja API Running")
})

app.route("/auth", authRoute)
app.route("/reports", reportRoute)
app.route("/comments", commmentRoute)


export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch
}