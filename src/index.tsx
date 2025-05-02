/** @jsxImportSource react */

// Load environment variables
import "dotenv/config";

// react
import { renderToString } from "react-dom/server";

// hono
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

// openauth
import type { Theme } from "@openauthjs/openauth/ui/theme";
import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";

// prisma and db access
import { getOrCreateAuthenticatedCustomer } from "./db/customer.js";

// other libraries
import { subjects } from "./subjects.js";
import PostgresStorage from "./storage/postgres.js";
import { sendPinCode } from "./emails/sender.js";

const MY_THEME: Theme = {
  title: "NoLine-Deli",
  favicon: "/favicon.svg",
  radius: "lg",
  primary: { dark: "#fcf9fa", light: "#0f172b" },
  logo: "/favicon.svg",
};

// The "issuer" creates an openauth server, a portable hono application
const app = issuer({
  theme: MY_THEME,
  subjects,
  storage: PostgresStorage(),

  // Auth providers we are going to use
  providers: {
    code: CodeProvider(
      CodeUI({
        sendCode: async (claims, code) => {
          // Send an email with a pin code
          await sendPinCode(claims.email, code);
        },
      }),
    ),

    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email, code) => {
          // Send an email with a pin code
          await sendPinCode(email, code);
        },
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

        // Get or create a new customer who has been authenticated successfully
        customerId = await getOrCreateAuthenticatedCustomer(customerEmail);
        break;
      }

      case "password": {
        // Extract the supplied customer email from the payload
        const customerEmail = value.email;

        // Get or create a new customer who has been authenticated successfully
        customerId = await getOrCreateAuthenticatedCustomer(customerEmail);
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

// Serve static files from the local file system
app.use("*", serveStatic({ root: "./public" }));

const View = () => {
  return (
    <html>
      <head>
        <title>NoLine-Deli</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="./index.css" rel="stylesheet" />
      </head>
      <body className="flex h-screen items-center justify-center bg-white p-8">
        <img src="./logo.png" alt="logo" width={1024} height={1024} className="h-auto max-w-full object-contain" />
      </body>
    </html>
  );
};

app.get("/", (c) => c.html(renderToString(<View />)));

// Determine how to run the server based on whether it is in production or not
if (process.env.NODE_ENV !== "production") serve({ fetch: app.fetch, port: 3001 }, (info) => console.log(`Server is running on http://localhost:${info.port}`));
else serve(app);
