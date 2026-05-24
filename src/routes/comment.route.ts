import { Hono } from "hono";
import { 
    createComment,
    getComment,
    deleteComment
} from '../controllers/comment.controller';
import { verifyToken } from "../middlewares/verify";

const commmentRoute = new Hono()

commmentRoute.get("/report/:reportId", getComment)
commmentRoute.post("/", verifyToken, createComment)
commmentRoute.delete("/report/:reportId", verifyToken, deleteComment)

export default commmentRoute