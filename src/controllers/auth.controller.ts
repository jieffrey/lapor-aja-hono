import { Context } from "hono";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { emailValidate, createUser } from '../services/auth.service';
import { createToken } from '../utils/jwt';
import {
    setupPasswordResetTable,
    createResetTokenService,
    validateResetTokenService,
    markTokenUsedService,
    updatePasswordService,
} from "../services/user.service";

export const register = async (c: Context) => {
    try {
        const body = await c.req.json()

        const user = await emailValidate(
            body.email
        )
        if (user) {
            return c.json({
                success: false,
                message: "Email Already Exist!"
            },400
            )
        }

        // Password strength validation
        const pwd = body.password
        if (!pwd || typeof pwd !== "string") {
            return c.json({ success: false, message: "Password is required" }, 400)
        }
        if (!/[A-Z]/.test(pwd)) {
            return c.json({ success: false, message: "Password harus mengandung minimal 1 huruf besar" }, 400)
        }
        if (!/[a-z]/.test(pwd)) {
            return c.json({ success: false, message: "Password harus mengandung minimal 1 huruf kecil" }, 400)
        }
        if (!/[0-9]/.test(pwd)) {
            return c.json({ success: false, message: "Password harus mengandung minimal 1 angka" }, 400)
        }

        const hashed = await bcrypt.hash(pwd, 10)

        const newUser = await createUser(
            body.name,
            body.email,
            hashed
        )

        return c.json(
            {
                success: true,
                message: "Register Success!",
                data: newUser
            },201
        )
    } catch (error) {
        return c.json(
            {
                success: false,
                message: "Register Failed", error
            },500
        )
    }
}

export const login = async (c: Context) => {
    try {
        const body = await c.req.json()

        const user = await emailValidate(
            body.email
        )

        if (!user) {
            return c.json(
                {
                    success: false,
                    message: "User Not Found"
                }, 404
            )
        }

        const link = await bcrypt.compare(
            body.password,
            user.password
        )

        if (!link) {
            return c.json(
                {
                    success: false,
                    message: "Login Failed!"
                },401
            )
        }

        const token = createToken(
            user.id,
            user.role
        )

        const { password: _, ...userData } = user

        
            return c.json(
                {
                    success: true,
                    message: "Login Success!",
                    data: userData,
                    token
                },201
            )
            
    } catch (error) {
        return c.json(
            {
                success: false,
                message: error
            },500
        )
    }
}

export const forgotPassword = async (c: Context) => {
    try {
        const { email } = await c.req.json()
        if (!email) {
            return c.json({ success: false, message: "Email is required" }, 400)
        }

        const user = await emailValidate(email)
        if (!user) {
            // Don't reveal if email exists, but for user-friendliness we'll keep it simple
            return c.json({ success: false, message: "Email tidak ditemukan" }, 404)
        }

        // Ensure tables exist
        await setupPasswordResetTable()

        // Generate token
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await createResetTokenService(user.id, token, expiresAt)

        // In production, send email with reset link
        // For demo, return the token so frontend can navigate
        return c.json({
            success: true,
            message: "Link reset password telah dikirim ke email",
            // In production, remove token from response and actually send email
            token,
        }, 200)
    } catch (error) {
        return c.json({ success: false, message: "Gagal memproses permintaan", error }, 500)
    }
}

export const resetPassword = async (c: Context) => {
    try {
        const { token, password } = await c.req.json()
        if (!token || !password) {
            return c.json({ success: false, message: "Token dan password baru diperlukan" }, 400)
        }

        if (password.length < 6) {
            return c.json({ success: false, message: "Password minimal 6 karakter" }, 400)
        }

        await setupPasswordResetTable()

        const record = await validateResetTokenService(token)
        if (!record) {
            return c.json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa" }, 400)
        }

        const hashed = await bcrypt.hash(password, 10)
        await updatePasswordService(record.user_id, hashed)
        await markTokenUsedService(record.id)

        return c.json({ success: true, message: "Password berhasil direset, silakan login" }, 200)
    } catch (error) {
        return c.json({ success: false, message: "Gagal mereset password", error }, 500)
    }
}
