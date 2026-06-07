import pool from "../database/database";

export const getUserService = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, points, created_at, avatar_url
        FROM users
        ORDER BY id DESC
        `,
  );
  return result.rows;
};

export const getUserByIdService = async (id: string) => {
  const result = await pool.query(
    `SELECT id, name, email, role, points, created_at, avatar_url
        FROM users
        WHERE id = $1
        `,
    [id],
  );
  return result.rows[0];
};

export const updateUserRoleService = async (id: string, role: string) => {
  const result = await pool.query(
    `
        UPDATE users
        SET role = $1,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
    [role, id],
  );
  return result.rows[0];
};

export const deleteUserService = async (id: string) => {
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
};

export const getLeaderboardService = async () => {
  const result = await pool.query(
    `SELECT id, name, email, points, role, created_at, avatar_url
         FROM users 
         WHERE role = 'user' 
         ORDER BY points DESC 
         LIMIT 50`,
  );
  return result.rows;
};

export const updateUserProfileService = async (
  id: string,
  fields: {
    name?: string;
    email?: string;
    password?: string;
    avatar_url?: string;
  },
) => {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${idx++}`);
    values.push(fields.name);
  }
  if (fields.email !== undefined) {
    sets.push(`email = $${idx++}`);
    values.push(fields.email);
  }
  if (fields.password !== undefined) {
    sets.push(`password = $${idx++}`);
    values.push(fields.password);
  }
  if (fields.avatar_url !== undefined) {
    sets.push(`avatar_url = $${idx++}`);
    values.push(fields.avatar_url);
  }

  if (sets.length === 0) {
    return getUserByIdService(id);
  }

  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id, name, email, role, points, created_at, avatar_url`,
    values,
  );
  return result.rows[0];
};

export const addPointsService = async (userId: number, points: number) => {
    await pool.query(
        `UPDATE users SET points = points + $1 WHERE id = $2`,
        [points, userId]
    )
}

export const setupPasswordResetTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'avatar_url'
      ) THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
      END IF;
    END $$;
  `);
};

export const createResetTokenService = async (userId: number, token: string, expiresAt: Date) => {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  );
};

export const validateResetTokenService = async (token: string) => {
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token],
  );
  return result.rows[0] ?? null;
};

export const markTokenUsedService = async (id: number) => {
  await pool.query(`UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`, [id]);
};

export const updatePasswordService = async (userId: number, hashedPassword: string) => {
  await pool.query(
    `UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [hashedPassword, userId],
  );
};
