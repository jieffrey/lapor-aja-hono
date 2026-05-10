import pool from "../database/database";

export const getUserService = async () => {
    const result = await pool.query(
        `SELECT id, name, email, role, points, created_at
        FROM users
        ORDER BY id DESC
        `
    )
    return result.rows
}

export const getUserByIdService = async (id: string) => {
    const result = await pool.query(
        `SELECT id, name, email, role, points, created_at
        FROM users
        WHERE id = $1
        `, [id]
    )
    return result.rows[0]
}

export const updateUserRoleService = async (
    id: string,
    role: string
) => {
    const result = await pool.query(
        `
        UPDATE users
        SET role = $1,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `, [role, id]
    )
    return result.rows[0]
}

export const deleteUserService = async (id: string) => {
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1`, [id]
    )
}