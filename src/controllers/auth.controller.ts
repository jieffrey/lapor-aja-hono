import { Context } from "hono";
import bcrypt from "bcryptjs";
import { emailValidate, createUser } from '../services/auth.service';
import { createToken } from '../utils/jwt';

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

        const hashed = await bcrypt.hash(body.password, 10)

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
            }
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


        if (!token) {
            return c.json(
                {
                    success: true,
                    message: "Login Success!",
                    token
                },201
            )
        }
    } catch (error) {
        return c.json(
            {
                success: false,
                message: error
            },500
        )
    }
}