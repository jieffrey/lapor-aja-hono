import { resourceLimits } from "node:worker_threads";
import pool from "../database/database";

export const emailValidate = async (email: string) =>{
    const result = await pool.query(
        `SELECT * FROM users WHERE email =$1`,
        [email]
    )
    return result.rows[0]
}

export const createUser = async (
    name: string,
    email: string,
    password: string
) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
        RETURNING *`,
        [name, email, password]
    )
    return result.rows[0]
}