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
  auth: { user: process.env.TRANSPORTER_USER, pass: process.env.TRANSPORTER_PASS },
});

// Send an email using the nodemailer transporter
const sendEmail = (to: string, subject: string, emailHtml: string) =>
  TRANSPORTER.sendMail({ from: process.env.TRANSPORTER_USER, to, subject, html: emailHtml });

// Send an email with a pin code
export const sendPinCode = async (email: string, code: string): Promise<void> => {
  // Import the email template component and convert it into an html string
  const emailHtml = await render(<PinCode code={code} />);

  // Finally, send an email using the nodemailer transporter
  await sendEmail(email, "NoLine-Deli ► Your One-Time Login PIN", emailHtml);
};
