import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  quiet: true, // <— sem logs
});

import { Pool } from "pg";

function makePool() {
  return new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });
}

let pool: Pool;

if (process.env.NODE_ENV === "test") {
  const g = globalThis as any;
  pool = g.pool ?? (g.pool = makePool());
} else {
  pool = makePool();
}

export default pool;
