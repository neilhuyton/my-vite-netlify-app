// netlify/functions/email.ts
import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { config } from "./config";

const transporter = nodemailer.createTransport({
  host: config.ZEPTO_SMTP_HOST,
  port: config.ZEPTO_SMTP_PORT,
  auth: { user: config.ZEPTO_SMTP_USER, pass: config.ZEPTO_SMTP_PASS },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: `"Weight Tracker" <${config.ZEPTO_SENDER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send email",
    });
  }
}
