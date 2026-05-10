import { Hono } from "hono";
import { 
    createComment,
    getComment,
    deleteComment
} from '../controllers/comment.controller';
import { verifyToken } from "../middlewares/verify";

const commmentRoute = new Hono()

commmentRoute.get("/report/:reportId", getComment)
commmentRoute.post("/", createComment, verifyToken)
commmentRoute.delete("/report/:reportId", deleteComment, verifyToken)

export default commmentRoute