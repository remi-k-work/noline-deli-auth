/* eslint-disable @typescript-eslint/no-explicit-any */

// openauth
import { joinKey, splitKey, type StorageAdapter } from "@openauthjs/openauth/storage/storage";

// other libraries
import { Pool } from "pg";

// Connect on module load
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default function PostgresStorage(): StorageAdapter {
  return {
    async get(keyParts: string[]): Promise<Record<string, any> | undefined> {
      const key = joinKey(keyParts);

      const client = await pool.connect();
      try {
        const result = await client.query("SELECT value FROM openauth_storage WHERE key = $1 AND (expiry IS NULL OR expiry > NOW())", [key]);
        return result.rows[0]?.value;
      } catch (error) {
        console.error("Error getting key from PostgreSQL", error);
        throw error;
      } finally {
        client.release();
      }
    },

    async set(keyParts: string[], value: any, expiry?: Date): Promise<void> {
      const key = joinKey(keyParts);

      const client = await pool.connect();
      try {
        await client.query(
          "INSERT INTO openauth_storage (key, value, expiry) VALUES ($1, $2::jsonb, $3) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, expiry = $3",
          [key, JSON.stringify(value), expiry],
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

    async *scan(prefixParts: string[]): AsyncIterable<[string[], any]> {
      const prefix = joinKey(prefixParts);

      const client = await pool.connect();
      try {
        const result = await client.query("SELECT key, value FROM openauth_storage WHERE key LIKE $1 AND (expiry IS NULL OR expiry > NOW())", [
          `${prefix}${String.fromCharCode(0x1f)}%`,
        ]);

        for (const row of result.rows) {
          yield [splitKey(row.key), row.value];
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
