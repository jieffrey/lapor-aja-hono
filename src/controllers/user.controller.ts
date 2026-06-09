import { Context } from "hono"
import bcrypt from "bcryptjs"

import {
    getUserService,
    deleteUserService,
    getUserByIdService,
    updateUserRoleService,
    getLeaderboardService,
    updateUserProfileService
} from "../services/user.service"
import cloudinary from "../utils/cloudinary"

export const getUsers = async (c: Context) => {
    try {
        const users = await getUserService()

        return c.json(
            {
                success: true,
                data: users
            }
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                error
            },
            500
        )
    }
}

export const getUserById = async (c: Context) => {
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

        const user = await getUserByIdService(id)

        return c.json({
            success: true,
            data: user
        })
    } catch (error) {
        return c.json(
            {
                success: false,
                error
            },
            500
        )
    }
}

export const updateUserRole =async (c: Context) => {
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

        const body = await c.req.json()

        const user = await updateUserRoleService(
            id,
            body.role
        )

        return c.json(
            {
                success: true,
                message: "Role updated",
                data: user
            }
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

export const updateUserProfile = async (c: Context) => {
    try {
        const id = c.req.param("id")
        if (!id) {
            return c.json({ success: false, message: "Missing id parameter" }, 400)
        }
        const payload = c.get("jwtPayload") as { id: number; role: string }

        // Only the user themselves or superadmin can update profile
        if (String(payload.id) !== id && payload.role !== "superadmin") {
            return c.json({ success: false, message: "Forbidden Access" }, 403)
        }

        const fields: Record<string, string> = {}

        // Try formData first (supports file upload), fall back to JSON
        const contentType = c.req.header("content-type") ?? ""
        if (contentType.includes("multipart/form-data")) {
            const formData = await c.req.formData()

            const name = formData.get("name")
            if (name && typeof name === "string" && name.trim()) fields.name = name.trim()

            const email = formData.get("email")
            if (email && typeof email === "string" && email.trim()) fields.email = email.trim()

            const password = formData.get("password")
            if (password && typeof password === "string" && password.trim()) {
                fields.password = await bcrypt.hash(password.trim(), 10)
            }

            const avatarFile = formData.get("avatar")
            if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
                const buffer = await avatarFile.arrayBuffer()
                const base64 = Buffer.from(buffer).toString("base64")
                const dataUri = `data:${avatarFile.type};base64,${base64}`
                const uploaded = await cloudinary.uploader.upload(dataUri, {
                    folder: "laporaja/avatars",
                })
                fields.avatar_url = uploaded.secure_url
            }
        } else {
            const body = await c.req.json()
            if (body.name && typeof body.name === "string" && body.name.trim()) fields.name = body.name.trim()
            if (body.email && typeof body.email === "string" && body.email.trim()) fields.email = body.email.trim()
            if (body.password && typeof body.password === "string" && body.password.trim()) {
                fields.password = await bcrypt.hash(body.password.trim(), 10)
            }
            if (body.avatar_url && typeof body.avatar_url === "string") fields.avatar_url = body.avatar_url
        }

        if (Object.keys(fields).length === 0) {
            return c.json({ success: false, message: "Tidak ada data yang diubah" }, 400)
        }

        // Validate email uniqueness
        if (fields.email) {
            const { emailValidate } = await import("../services/auth.service")
            const existing = await emailValidate(fields.email)
            if (existing && String(existing.id) !== id) {
                return c.json({ success: false, message: "Email sudah digunakan" }, 409)
            }
        }

        const user = await updateUserProfileService(id, fields)
        return c.json({ success: true, message: "Profile updated", data: user })
    } catch (error) {
        return c.json({ success: false, error }, 500)
    }
}

export const deleteUser = async (c: Context) => {
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
        await deleteUserService(id)

        return c.json(
            {
                success: true,
                message: "User deleted"
            }
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

export const getLeaderboard = async (c: Context) => {
    try {
        const users = await getLeaderboardService()
        return c.json({ success: true, data: users })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return c.json({ success: false, message, error: message }, 500)
    }
}
