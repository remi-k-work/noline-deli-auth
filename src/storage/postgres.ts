// openauth
import { joinKey, splitKey, type StorageAdapter } from "@openauthjs/openauth/storage/storage";

// other libraries
import { Pool } from "pg";

// Connect on module load (use ssl connection to the postgres server in production only)
const pool = process.env.DATABASE_URL?.includes("localhost")
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default function PostgresStorage(): StorageAdapter {
  return {
    async get(keyParts: string[]): Promise<Record<string, unknown> | undefined> {
      const key = joinKey(keyParts);

      const client = await pool.connect();
      try {
        const row = (await client.query("SELECT value, expiry FROM openauth_storage WHERE key = $1", [key])).rows[0];

        // Make sure the row exists
        if (!row) return;
        const { value, expiry } = row;

        // If entry has expired, remove it and return undefined; otherwise, return the value
        if (expiry && expiry < new Date()) await client.query("DELETE FROM openauth_storage WHERE key = $1", [key]);
        else return value?.value;
      } catch (error) {
        console.error("Error getting key from PostgreSQL", error);
        throw error;
      } finally {
        client.release();
      }
    },

    async set(keyParts: string[], value: unknown, expiry?: Date): Promise<void> {
      const key = joinKey(keyParts);

      const client = await pool.connect();
      try {
        await client.query(
          "INSERT INTO openauth_storage (key, value, expiry) VALUES ($1, $2::jsonb, $3) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, expiry = $3",
          [key, { value }, expiry],
        );
      } catch (error) {
        console.error("Error setting key in PostgreSQL", error);
        throw error;
      } finally {
        client.release();
      }
    },

    async remove(keyParts: string[]): Promise<void> {
      const key = joinKey(keyParts);

      const client = await pool.connect();
      try {
        await client.query("DELETE FROM openauth_storage WHERE key = $1", [key]);
      } catch (error) {
        console.error("Error removing key from PostgreSQL", error);
        throw error;
      } finally {
        client.release();
      }
    },

    async *scan(prefixParts: string[]): AsyncIterable<[string[], unknown]> {
      const prefix = joinKey(prefixParts);

      const client = await pool.connect();
      try {
        const result = await client.query("SELECT key, value, expiry FROM openauth_storage WHERE key LIKE $1", [`${prefix}${String.fromCharCode(0x1f)}%`]);

        for (const { key, value, expiry } of result.rows) {
          // If entry has expired, skip it
          if (expiry && expiry < new Date()) continue;
          yield [splitKey(key), value?.value];
        }
      } catch (error) {
        console.error("Error scanning keys in PostgreSQL", error);
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
