import pool from "../database/database";

export const createReportService = async (
    user_id: string,
    title: string,
    description: string,
    category: string,
    priority: string,
    latitude: string,
    longitude: string,
    image_before: string | null
) => {
    const result = await pool.query(
        `INSERT INTO report (user_id, title, description, category, priority, latitude, longitude, image_before)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [user_id, title, description, category, priority, latitude, longitude, image_before]
    )
    return result.rows[0]
}

export const getReportService = async () => {
    const result = await pool.query(
        `SELECT report.*, users.name 
        FROM report 
        JOIN users
        ON users.id = report.user_id
        ORDER BY report.id DESC
        `
    )
    return result.rows
}

export const getReportByIdService = async (id: string) => {
    const result =await pool.query(
        `SELECT report.*, users.name
        FROM report
        JOIN users
        ON users.id = report.user_id
        WHERE report.id = $1
        `, [id]
    )
    return result.rows[0]
}


export const updateReportService = async (
    id: string,
    title: string,
    description: string,
    category: string,
    image_before: string
) => {
    const result = await pool.query(
        `UPDATE report
        SET 
        title = $1,
        description = $2,
        category = $3,
        image_before = $4,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *`,
        [title, description, category, image_before, id]
    )
    return result.rows[0]
}

export const deleteReportService = async (id: string) => {
    const result = await pool.query(
        `DELETE FROM report WHERE id = $1`, [id]
    )
}