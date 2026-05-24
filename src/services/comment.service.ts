import pool from "../database/database";

export const createCommentService = async (
    user_id: string,
    report_id: string,
    comment: string
) => {
    const result = await pool.query(
        `INSERT INTO comments (user_id, report_id, comment)
        VALUES ($1, $2, $3) RETURNING *`,
        [user_id, report_id, comment]
    )
    return result.rows[0]
}

export const getCommentService = async (reportId: string) => {
    const result = await pool.query(
        `SELECT comments.*, users.name
        FROM comments
        JOIN users
        ON user_id = comments.user_id
        WHERE report_id = $1
        ORDER BY comments.id DESC`, [reportId]
    )
    return result.rows
}

export const deleteCommentService = async (id: string) => {
    const result = await pool.query(
        `DELETE FROM comments WHERE id = $1`, [id]
    )
}