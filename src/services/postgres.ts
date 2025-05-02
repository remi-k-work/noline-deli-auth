import { Pool } from "pg";

const poolSingleton = () => {
  // Connect on module load (use ssl connection to the postgres server in production only)
  return process.env.NODE_ENV !== "production"
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
};

declare global {
  // eslint-disable-next-line no-var
  var pool: undefined | ReturnType<typeof poolSingleton>;
}

const pool = globalThis.pool ?? poolSingleton();

export default pool;

if (process.env.NODE_ENV !== "production") globalThis.pool = pool;
