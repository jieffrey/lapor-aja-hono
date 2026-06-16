import { Hono } from "hono"
import authRoute from './routes/auth.route';
import reportRoute from "./routes/report.route";
import commmentRoute from "./routes/comment.route";
import userRoute from "./routes/user.route";
import { cors } from "hono/cors";
import * as Jwt from "jsonwebtoken"
import notificationRoute from "./routes/notification.route";
import { setupPasswordResetTable } from "./services/user.service";
import aiRoute from "./routes/ai.route";

const app = new Hono()

// Ensure required tables and columns exist
setupPasswordResetTable().catch(console.error)

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
)

app.get("/", (c) => {
  return c.text("LaporAja API Running")
})

app.route("/auth", authRoute)
app.route("/reports", reportRoute)
app.route("/comments", commmentRoute)
app.route("/user", userRoute)
app.route("/notifications", notificationRoute)
app.route("/ai", aiRoute)



export default {
  port: Number(process.env.PORT) || 5000,
  fetch: app.fetch
}