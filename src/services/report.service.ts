import pool from "../database/database";

export const createReportService = async (
  user_id: string,
  title: string,
  description: string,
  category: string,
  priority: string,
  latitude: string,
  longitude: string,
  image_before: string | null,
  images: string[] = [],
) => {
  const result = await pool.query(
    `INSERT INTO report (
    user_id, 
    title, 
    description, 
    category, 
    priority, 
    latitude, 
    longitude, 
    image_before, 
    images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      user_id,
      title,
      description,
      category,
      priority,
      latitude,
      longitude,
      image_before,
      images,
    ],
  );
  return result.rows[0];
};

export const getReportService = async () => {
  const result = await pool.query(
    `SELECT report.*, users.name 
        FROM report 
        JOIN users
        ON users.id = report.user_id
        ORDER BY report.id DESC
        `,
  );
  return result.rows;
};

export const getReportByIdService = async (id: string) => {
  const result = await pool.query(
    `SELECT report.*, users.name
        FROM report
        JOIN users
        ON users.id = report.user_id
        WHERE report.id = $1
        `,
    [id],
  );
  return result.rows[0];
};

export const updateReportService = async (
  id: string,
  title: string,
  description: string,
  category: string,
  image_before: string,
  priority: string,
) => {
  const result = await pool.query(
    `UPDATE report
        SET 
        title = $1,
        description = $2,
        category = $3,
        image_before = $4,
        priority = $5
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *`,
    [title, description, category, image_before, priority, id],
  );
  return result.rows[0];
};

export const deleteReportService = async (id: string) => {
  const result = await pool.query(`DELETE FROM report WHERE id = $1`, [id]);
};
export const updateReportStatusService = async (id: string, status: string) => {
  const result = await pool.query(
    `
    UPDATE report
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [status, id],
  );

  return result.rows[0];
};
