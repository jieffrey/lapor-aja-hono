import { Context } from "hono";
import {
    createCommentService,
    getCommentService,
    deleteCommentService
} from "../services/comment.service";
import console from "node:console";

export const createComment = async (c: Context) => {
    try {
        const body = await c.req.json()

        const payload = c.get(
            "jwtPayload"
        ) as {
            id: number,
            role: string
        }

        const comment = await createCommentService(
            body.report_id,
            String(payload.id),
            body.comment
        )
        return c.json(
            {
                success: true,
                message: "Comment Created",
                data: comment
            }, 201
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                message: "Failed Create Comment", error
            }, 500
        )
    }
}

export const getComment = async (c: Context) => {
    try {
        const reportId = c.req.param("reportId")

        if (!reportId) {
            return c.json(
                {
                    success: false,
                    message: "Missing id parameter"
                }, 400
            )
        }

        const comments = await getCommentService(reportId)
        
        return c.json(
            {
                success: true,
                data: comments
            }, 201
        )
    } catch (error) {
        return c.json (
            {
                success: false,
                error
            }, 500
        )
    }
}

export const deleteComment = async (c: Context) => {
    try {
        const id = c.req.param("id")

        if (!id) {
            return c.json(
                {
                    success: false,
                    message: "Missing id parameter"
                }, 400
            )
        }

        await deleteCommentService(id)

        return c.json(
            {
                success: true,
                message: "Comment Deleted!"
            }, 200
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                error
            }, 500
        )
    }
}