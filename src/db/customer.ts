// prisma and db access
import pool from "../services/postgres.js";

// other libraries
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import stripe from "../services/stripe.js";

// Get or create a new customer who has been authenticated successfully
export async function getOrCreateAuthenticatedCustomer(email: string): Promise<string> {
  // Are we dealing with the already existing/registered customer?
  const customerId = await getExistingCustomer(email);

  // If not, create a new customer who has been authenticated successfully
  return customerId ?? newAuthenticatedCustomer(email);
}

// Create a new customer who has been authenticated successfully
async function newAuthenticatedCustomer(email: string): Promise<string> {
  // Establish a new customer id
  const customerId = uuidv4();

  // Will hold the corresponding stripe customer id
  let stripeCustomerId: string | undefined;

  const client = await pool.connect();
  try {
    // Begin the database transaction
    await client.query("BEGIN");

    // Create a new stripe customer that is linked to our existing customer (store the generated customer id in stripe's metadata for linking)
    const stripeCustomer: Stripe.Customer = await stripe.customers.create({ email, preferred_locales: ["en"], metadata: { customerId } });
    stripeCustomerId = stripeCustomer.id;

    // Create a corresponding customer record in our database; this ensures that our database and stripe are synchronized
    await client.query('INSERT INTO "Customer" (id, "stripeCustomerId", email, name, "isTest", "updatedAt") VALUES ($1, $2, $3, $3, false, NOW())', [
      customerId,
      stripeCustomerId,
      email,
    ]);

    // Commit the database transaction
    await client.query("COMMIT");

    // Return the new customer id
    return customerId;
  } catch (error) {
    console.error("Error creating customer", error);

    // If stripe customer was created, attempt to delete it as a compensating action
    if (stripeCustomerId) {
      try {
        await stripe.customers.del(stripeCustomerId);
      } catch (error) {
        console.error("Error deleting the corresponding Stripe customer", error);
      }
    }

    // Re-throw the original error to the caller
    throw error;
  } finally {
    client.release();
  }
}

// Are we dealing with the already existing/registered customer?
async function getExistingCustomer(email: string): Promise<string | undefined> {
  const client = await pool.connect();
  try {
    const row = (await client.query('SELECT id FROM "Customer" WHERE email = $1', [email])).rows[0];

    // Make sure the row exists
    if (!row) return;
    const { id } = row;

    // Return the existing customer id
    return id;
  } catch (error) {
    console.error("Error getting customer id from email in PostgreSQL", error);
    throw error;
  } finally {
    client.release();
  }
}
