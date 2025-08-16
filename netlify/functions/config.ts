// netlify/functions/config.ts
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const envSchema = z.object({
  JWT_SECRET: z.string().default("your-secret-key"),
  APP_URL: z.string().default("http://localhost:3000"),
  ZEPTO_SMTP_HOST: z.string().default("smtp.zeptomail.eu"),
  ZEPTO_SMTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(587),
  ZEPTO_SMTP_USER: z.string().default("emailappsmtp.2bcee7c87e4c324"),
  ZEPTO_SMTP_PASS: z.string().default("BDTNGiFyecSh"),
  ZEPTO_SENDER: z.string().email().default("noreply@neilhuyton.com"),
});

export const config = envSchema.parse(process.env);
export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
