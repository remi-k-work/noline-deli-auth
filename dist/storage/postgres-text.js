/* eslint-disable @typescript-eslint/no-explicit-any */
// openauth
import { joinKey, splitKey } from "@openauthjs/openauth/storage/storage";
// other libraries
import { Pool } from "pg";
// Connect on module load (use ssl connection to the postgres server in production only)
const pool = process.env.DATABASE_URL?.includes("localhost")
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
export default function PostgresTextStorage() {
    const TABLE_NAME = "openauth_storage_text"; // Use the new table name
    return {
        async get(keyParts) {
            const key = joinKey(keyParts);
            const client = await pool.connect();
            try {
                const result = await client.query(`SELECT value, expiry FROM ${TABLE_NAME} WHERE key = $1 AND (expiry IS NULL OR expiry > $2)`, [key, Date.now()]);
                if (result.rows[0]) {
                    const row = result.rows[0];
                    return JSON.parse(row.value);
                }
                return undefined;
            }
            catch (error) {
                console.error("Error getting key from PostgreSQL (TEXT)", error);
                throw error;
            }
            finally {
                client.release();
            }
        },
        async set(keyParts, value, expiry) {
            const key = joinKey(keyParts);
            // Handle both date objects and ttl numbers while maintaining date type in signature
            const expiryTimestamp = expiry ? expiry.getTime() : expiry;
            const client = await pool.connect();
            try {
                await client.query(`INSERT INTO ${TABLE_NAME} (key, value, expiry) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2, expiry = $3`, [
                    key,
                    JSON.stringify(value),
                    expiryTimestamp,
                ]);
            }
            catch (error) {
                console.error("Error setting key in PostgreSQL (TEXT)", error);
                throw error;
            }
            finally {
                client.release();
            }
        },
        async remove(keyParts) {
            const key = joinKey(keyParts);
            const client = await pool.connect();
            try {
                await client.query(`DELETE FROM ${TABLE_NAME} WHERE key = $1`, [key]);
            }
            catch (error) {
                console.error("Error removing key from PostgreSQL (TEXT)", error);
                throw error;
            }
            finally {
                client.release();
            }
        },
        async *scan(prefixParts) {
            const prefix = joinKey(prefixParts);
            const client = await pool.connect();
            try {
                const result = await client.query(`SELECT key, value, expiry FROM ${TABLE_NAME} WHERE key LIKE $1 AND (expiry IS NULL OR expiry > $2)`, [
                    `${prefix}${String.fromCharCode(0x1f)}%`,
                    Date.now(),
                ]);
                for (const row of result.rows) {
                    yield [splitKey(row.key), JSON.parse(row.value)];
                }
            }
            catch (error) {
                console.error("Error scanning keys in PostgreSQL (TEXT)", error);
                throw error;
            }
            finally {
                client.release();
            }
        },
    };
}
