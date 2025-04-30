import { jsx as _jsx } from "react/jsx-runtime";
/** @jsxImportSource react */
// other libraries
import nodemailer from "nodemailer";
// components
import { render } from "@react-email/components";
import PinCode from "./PinCode.js";
// Create a nodemailer transporter
const TRANSPORTER = nodemailer.createTransport({
    host: process.env.TRANSPORTER_HOST,
    port: 587,
    secure: process.env.DATABASE_URL?.includes("localhost") ? false : true,
    auth: { user: process.env.TRANSPORTER_USER, pass: process.env.TRANSPORTER_PASS },
});
// Send an email using the nodemailer transporter
const sendEmail = (to, subject, emailHtml) => TRANSPORTER.sendMail({ from: process.env.TRANSPORTER_USER, to, subject, html: emailHtml });
// Send an email with a pin code
export const sendPinCode = async (email, code) => {
    // Import the email template component and convert it into an html string
    const emailHtml = await render(_jsx(PinCode, { code: code }));
    // Finally, send an email using the nodemailer transporter
    await sendEmail(email, "NoLine-Deli ► Your One-Time Login PIN", emailHtml);
};
