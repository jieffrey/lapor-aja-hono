import { Context } from "hono"

import {
    getUserService,
    deleteUserService,
    getUserByIdService,
    updateUserRoleService,
} from "../services/user.service"

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