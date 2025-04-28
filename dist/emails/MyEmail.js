import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Body, Button, Html, Preview } from "@react-email/components";
export default function MyEmail() {
    return (_jsxs(Html, { children: [_jsx(Preview, { children: "Download and view receipt" }), _jsx(Body, { children: _jsx(Button, { href: "https://example.com", style: { background: "#000", color: "#fff", padding: "12px 20px" }, children: "Click me" }) })] }));
}
