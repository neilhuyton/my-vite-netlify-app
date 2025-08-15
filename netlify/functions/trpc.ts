// netlify/functions/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import * as nodemailer from "nodemailer";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const ZEPTO_SMTP_HOST = process.env.ZEPTO_SMTP_HOST || "smtp.zeptomail.eu";
const ZEPTO_SMTP_PORT = parseInt(process.env.ZEPTO_SMTP_PORT || "587");
const ZEPTO_SMTP_USER =
  process.env.ZEPTO_SMTP_USER || "emailappsmtp.2bcee7c87e4c324";
const ZEPTO_SMTP_PASS = process.env.ZEPTO_SMTP_PASS || "BDTNGiFyecSh";
const ZEPTO_SENDER = process.env.ZEPTO_SENDER || "noreply@neilhuyton.com";

const transporter = nodemailer.createTransport({
  host: ZEPTO_SMTP_HOST,
  port: ZEPTO_SMTP_PORT,
  auth: {
    user: ZEPTO_SMTP_USER,
    pass: ZEPTO_SMTP_PASS,
  },
});

type TRPCContext = {
  event: HandlerEvent;
  context: HandlerContext;
  prisma: PrismaClient;
  user?: { id: number; email: string };
};

const t = initTRPC.context<TRPCContext>().create();

// Email sending utility
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const mailOptions = {
    from: `"Weight Tracker" <${ZEPTO_SENDER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send email",
    });
  }
}

// Authentication middleware
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const token = ctx.event.headers.authorization?.split("Bearer ")[1];
  if (!token)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };
    return next({ ctx: { ...ctx, user: decoded } });
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }
});

const protectedProcedure = t.procedure.use(isAuthenticated);

export const appRouter = t.router({
  signup: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already exists",
        });

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const verificationToken = randomUUID();
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          verificationToken,
        },
      });

      const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: input.email,
        subject: "Verify Your Email",
        html: `
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      return { message: "Signup successful. Please verify your email." };
    }),

  login: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      if (!user.isEmailVerified)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email not verified",
        });

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return { token, user: { id: user.id, email: user.email } };
    }),

  verifyEmail: t.procedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findFirst({
        where: { verificationToken: input.token },
      });
      if (!user)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token",
        });

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, verificationToken: null },
      });

      return { message: "Email verified successfully" };
    }),

  requestPasswordReset: t.procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email not found",
        });
      if (!user.isEmailVerified)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email not verified",
        });

      const resetPasswordToken = randomUUID();
      const resetPasswordTokenExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ); // 24 hours
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetPasswordTokenExpiresAt },
      });

      const resetUrl = `${APP_URL}/reset-password?token=${resetPasswordToken}`;
      await sendEmail({
        to: input.email,
        subject: "Reset Your Password",
        html: `
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      return { message: "Password reset email sent" };
    }),

  resetPassword: t.procedure
    .input(z.object({ token: z.string(), newPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: input.token,
          resetPasswordTokenExpiresAt: { gt: new Date() },
        },
      });
      if (!user)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token",
        });

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });

      return { message: "Password reset successfully" };
    }),

  getWeights: protectedProcedure.query(async ({ ctx }) => ({
    measurements: await ctx.prisma.weightMeasurement.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "desc" },
    }),
  })),

  addWeight: protectedProcedure
    .input(
      z.object({
        weightKg: z.number(),
        note: z.string().optional(), // Add optional note field
      })
    )
    .mutation(async ({ ctx, input }) => ({
      message: "Weight added",
      measurement: await ctx.prisma.weightMeasurement.create({
        data: {
          weightKg: input.weightKg,
          note: input.note, // Include note in the data
          userId: ctx.user!.id,
        },
      }),
    })),

  deleteWeight: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.weightMeasurement.delete({
        where: { id: input.id, userId: ctx.user!.id },
      })
    ),
});

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const headers = new Headers(
      Object.entries(event.headers).filter(
        ([, v]) => typeof v === "string"
      ) as [string, string][]
    );
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(
        `https://${event.headers.host ?? "localhost"}${event.path}`,
        {
          method: event.httpMethod,
          headers,
          body: ["POST", "PUT"].includes(event.httpMethod)
            ? event.body
            : undefined,
        }
      ),
      router: appRouter,
      createContext: () => ({ event, context, prisma }),
    });

    return {
      statusCode: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        "Access-Control-Allow-Origin": "*",
      },
      body: await response.text(),
    };
  } catch (error) {
    console.error("tRPC handler error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

export type AppRouter = typeof appRouter;
