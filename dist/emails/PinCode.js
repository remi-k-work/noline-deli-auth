import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
// Load environment variables
import "dotenv/config";
// components
import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Tailwind, Text } from "@react-email/components";
PinCode.PreviewProps = {
    code: "123456",
};
export default function PinCode({ code }) {
    return (_jsxs(Html, { children: [_jsx(Head, { children: _jsx("title", { children: "NoLine-Deli \u25BA Your One-Time Login PIN" }) }), _jsx(Tailwind, { children: _jsxs(Body, { className: "bg-white text-center font-sans text-gray-500", children: [_jsx(Preview, { children: "NoLine-Deli \u25BA Your One-Time Login PIN" }), _jsxs(Container, { className: "mx-auto max-w-xl rounded-xl border border-solid border-gray-500 p-4", children: [_jsx(Img, { src: `${process.env.AUTH_SERVER_URL}/logo.png`, alt: "logo", width: 1024, height: 1024, className: "mx-auto h-36 w-auto" }), _jsx(Hr, {}), _jsx(Text, { children: "Here is your one-time PIN to log in:" }), _jsx(Heading, { children: code }), _jsx(Text, { children: "Please enter this PIN on the login page." }), _jsx(Text, { children: "This PIN will expire shortly for security reasons." }), _jsx(Hr, {}), _jsx(Img, { src: `${process.env.AUTH_SERVER_URL}/favicon.svg`, alt: "logo", width: 16, height: 16, className: "mx-auto h-9 w-auto" }), _jsx(Text, { className: "text-black", children: "Thanks, The NoLine-Deli Team" })] })] }) })] }));
}
