/* eslint-disable @typescript-eslint/no-unused-vars */

// Load environment variables
import "dotenv/config";

// hono
import { serve } from "@hono/node-server";

// openauth
import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";

// other libraries
import { subjects } from "./subjects.js";
import PostgresStorage from "./storage/postgres.js";

// Either get the existing customer id or create a new one
async function getOrCreateCustomerId(customerEmail: string) {
  // Get user from database
  // Return user ID
  return "123";
}

// The "issuer" creates an openauth server, a portable hono application
const app = issuer({
  subjects,
  storage: PostgresStorage(),

  // Auth providers we are going to use
  providers: {
    code: CodeProvider(
      CodeUI({
        sendCode: async (email, code) => console.log(email, code),
      }),
    ),

    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email, code) => console.log(email, code),
      }),
    ),
  },

  // The success callback receives the payload when a user completes a provider’s auth flow
  success: async ({ subject }, value) => {
    // Either the existing or a new customer id
    let customerId: string;

    // Determine which auth provider has been used
    switch (value.provider) {
      case "code": {
        // Extract the supplied customer email from the payload
        const customerEmail = value.claims.email;

        // Either get the existing customer or create a new one
        customerId = await getOrCreateCustomerId(customerEmail);
        break;
      }

      case "password": {
        // Extract the supplied customer email from the payload
        const customerEmail = value.email;

        // Either get the existing customer or create a new one
        customerId = await getOrCreateCustomerId(customerEmail);
        break;
      }

      default:
        // Unrecognized auth provider
        throw new Error("Invalid auth provider!");
    }

    // Once complete, issue the access tokens that a client can use
    return subject("customer", { customerId });
  },
});

// Determine how to run the server based on whether it is in production or not
if (process.env.DATABASE_URL?.includes("localhost"))
  serve({ fetch: app.fetch, port: 3001 }, (info) => console.log(`Server is running on http://localhost:${info.port}`));
else serve(app);
