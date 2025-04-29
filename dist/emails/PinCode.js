import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
// Load environment variables
import "dotenv/config";
import { Body, Button, Container, Head, Html, Img, Preview, Section, Tailwind } from "@react-email/components";
export default function PinCode() {
    return (_jsxs(Html, { children: [_jsx(Head, { children: _jsx("title", { children: "NoLine-Deli \u25BA Pin Code" }) }), _jsx(Tailwind, { children: _jsxs(Body, { className: "bg-white font-sans", children: [_jsx(Preview, { children: "NoLine-Deli \u25BA Pin Code" }), _jsxs(Container, { className: "m-auto max-w-xl rounded-xl border border-solid border-gray-500 p-8", children: [_jsx(Section, { children: _jsx(Img, { src: `${process.env.AUTH_SERVER_URL}/logo.png`, alt: "logo", width: 1024, height: 1024, className: "h-auto max-w-full object-contain" }) }), _jsx(Button, { href: "https://example.com", style: { background: "#000", color: "#fff", padding: "12px 20px" }, children: "Click me" })] })] }) })] }));
}
