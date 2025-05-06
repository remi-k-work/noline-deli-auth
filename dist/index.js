import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
// Load environment variables
import "dotenv/config";
// react
import { renderToString } from "react-dom/server";
// hono
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { GithubProvider } from "@openauthjs/openauth/provider/github";
// prisma and db access
import { getOrCreateAuthenticatedCustomer } from "./db/customer.js";
// other libraries
import { subjects } from "./subjects.js";
import PostgresStorage from "./storage/postgres.js";
import { sendPinCode } from "./emails/sender.js";
const MY_THEME = {
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
        code: CodeProvider(CodeUI({
            sendCode: async (claims, code) => {
                // Send an email with a pin code
                await sendPinCode(claims.email, code);
            },
        })),
        password: PasswordProvider(PasswordUI({
            sendCode: async (email, code) => {
                // Send an email with a pin code
                await sendPinCode(email, code);
            },
        })),
        github: GithubProvider({
            clientID: process.env.GITHUB_PROVIDER_CLIENT_ID,
            clientSecret: process.env.GITHUB_PROVIDER_CLIENT_SECRET,
            scopes: ["user:email"],
        }),
    },
    // The success callback receives the payload when a user completes a provider’s auth flow
    success: async ({ subject }, value) => {
        // The extracted customer email from the payload
        let customerEmail;
        // Determine which auth provider has been used
        switch (value.provider) {
            case "code":
                customerEmail = value.claims.email;
                break;
            case "password":
                customerEmail = value.email;
                break;
            case "github":
                // With this access token, we will be able to make authenticated requests as the logged-in user
                const accessToken = value.tokenset.access;
                // Fetch private emails from github (requires 'user:email' scope)
                const privateEmailsResponse = await fetch("https://api.github.com/user/emails", {
                    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
                });
                if (!privateEmailsResponse.ok)
                    throw new Error(`Failed to fetch private emails: ${privateEmailsResponse.statusText}`);
                const privateEmails = await privateEmailsResponse.json();
                // Find the primary and verified private email and use it as our customer email
                customerEmail = privateEmails.find((email) => email.primary && email.verified)?.email;
                if (!customerEmail)
                    throw new Error("No primary and verified email found on GitHub account!");
                break;
            default:
                // Unrecognized auth provider
                throw new Error("Invalid auth provider!");
        }
        // Get or create a new customer who has been authenticated successfully
        const customerId = await getOrCreateAuthenticatedCustomer(customerEmail);
        // Once complete, issue the access tokens that a client can use
        return subject("customer", { customerId });
    },
});
// Serve static files from the local file system
app.use("*", serveStatic({ root: "./public" }));
const View = () => {
    return (_jsxs("html", { children: [_jsxs("head", { children: [_jsx("title", { children: "NoLine-Deli" }), _jsx("meta", { charSet: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), _jsx("link", { href: "./index.css", rel: "stylesheet" })] }), _jsx("body", { className: "flex h-screen items-center justify-center bg-white p-8", children: _jsx("img", { src: "./logo.png", alt: "logo", width: 1024, height: 1024, className: "h-auto max-w-full object-contain" }) })] }));
};
app.get("/", (c) => c.html(renderToString(_jsx(View, {}))));
// Determine how to run the server based on whether it is in production or not
if (process.env.NODE_ENV !== "production")
    serve({ fetch: app.fetch, port: 3001 }, (info) => console.log(`Server is running on http://localhost:${info.port}`));
else
    serve(app);
