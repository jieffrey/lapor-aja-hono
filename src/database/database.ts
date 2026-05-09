import dotenv from "dotenv"
import pkg from "pg"

dotenv.config()

const { Pool } = pkg
const pool = new Pool ({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT)
})

pool.connect()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

export default pool