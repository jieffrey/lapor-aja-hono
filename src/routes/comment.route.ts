import { Hono } from "hono";
import { 
    createComment,
    getComment,
    deleteComment,
    getCommentByReport
} from '../controllers/comment.controller';
import { verifyToken } from "../middlewares/verify";

const commentRoute = new Hono()
commentRoute.get("/report/:reportId", getCommentByReport)
commentRoute.post("/", verifyToken, createComment)
commentRoute.delete("/report/:reportId", verifyToken, deleteComment)

export default commentRoute