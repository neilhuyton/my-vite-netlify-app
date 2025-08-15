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
  user?: { id: string; email: string };
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
      id: string;
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

  addWeight: protectedProcedure
    .input(
      z.object({
        weightKg: z.number(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => ({
      message: "Weight added",
      measurement: await ctx.prisma.weightMeasurement.create({
        data: {
          weightKg: input.weightKg,
          note: input.note,
          userId: ctx.user!.id,
        },
      }),
    })),

  deleteWeight: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.weightMeasurement.delete({
        where: { id: input.id, userId: ctx.user!.id },
      })
    ),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user!.id;
    await ctx.prisma.user.delete({
      where: { id: userId },
    });
    return { message: "Account deleted successfully" };
  }),

  setGoal: protectedProcedure
    .input(
      z.object({
        goalWeightKg: z.number().positive(),
        startWeightKg: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      const existingGoal = await ctx.prisma.goal.findUnique({
        where: { userId },
      });
      const goal = existingGoal
        ? await ctx.prisma.goal.update({
            where: { userId },
            data: {
              goalWeightKg: input.goalWeightKg,
              startWeightKg: input.startWeightKg,
              goalSetAt: new Date(),
            },
          })
        : await ctx.prisma.goal.create({
            data: {
              userId,
              goalWeightKg: input.goalWeightKg,
              startWeightKg: input.startWeightKg,
              goalSetAt: new Date(),
            },
          });
      return {
        message: "Goal set successfully",
        goalWeightKg: goal.goalWeightKg,
      };
    }),

  getGoal: protectedProcedure.query(async ({ ctx }) => {
    const goal = await ctx.prisma.goal.findUnique({
      where: { userId: ctx.user!.id },
      select: { goalWeightKg: true, goalSetAt: true, startWeightKg: true },
    });
    const latestWeight = await ctx.prisma.weightMeasurement.findFirst({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "desc" },
      select: { weightKg: true },
    });
    return {
      goalWeightKg: goal?.goalWeightKg || null,
      goalSetAt: goal?.goalSetAt || null,
      startWeightKg: goal?.startWeightKg || null,
      latestWeightKg: latestWeight?.weightKg || null,
    };
  }),

  clearGoal: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.goal.deleteMany({
      where: { userId: ctx.user!.id },
    });
    return { message: "Goal cleared successfully" };
  }),

  getWeights: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["30d", "90d", "all"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const timeFilter = input.timeRange
        ? {
            createdAt: {
              gte: new Date(
                Date.now() -
                  (input.timeRange === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000
              ),
            },
          }
        : {};
      const measurements = await ctx.prisma.weightMeasurement.findMany({
        where: { userId: ctx.user!.id, ...timeFilter },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          weightKg: true,
          note: true,
          createdAt: true,
        },
      });
      return { measurements };
    }),

  getWeightTrends: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["30d", "90d", "all"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const timeFilter = input.timeRange
        ? {
            createdAt: {
              gte: new Date(
                Date.now() -
                  (input.timeRange === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000
              ),
            },
          }
        : {};
      const measurements = await ctx.prisma.weightMeasurement.findMany({
        where: { userId: ctx.user!.id, ...timeFilter },
        orderBy: { createdAt: "asc" },
        select: { weightKg: true, createdAt: true },
      });

      if (!measurements.length) {
        return {
          weeklyAverages: [],
          monthlyAverages: [],
          rateOfChange: null,
          trendPoints: [],
          trendSlope: null,
        };
      }

      // Group by week (ISO week number)
      const weeklyAverages: {
        week: string;
        averageWeightKg: number;
        date: Date;
      }[] = [];
      const groupedByWeek: {
        [key: string]: { weights: number[]; date: Date };
      } = {};
      for (const m of measurements) {
        const date = new Date(m.createdAt);
        const yearWeek = `${date.getFullYear()}-W${
          Math.floor((date.getDate() + ((date.getDay() + 6) % 7)) / 7) + 1
        }`;
        if (!groupedByWeek[yearWeek]) {
          groupedByWeek[yearWeek] = { weights: [], date };
        }
        groupedByWeek[yearWeek].weights.push(m.weightKg);
      }
      for (const [yearWeek, group] of Object.entries(groupedByWeek)) {
        const avg =
          group.weights.reduce((sum, w) => sum + w, 0) / group.weights.length;
        weeklyAverages.push({
          week: yearWeek,
          averageWeightKg: avg,
          date: group.date,
        });
      }

      // Group by month (YYYY-MM)
      const monthlyAverages: {
        month: string;
        averageWeightKg: number;
        date: Date;
      }[] = [];
      const groupedByMonth: {
        [key: string]: { weights: number[]; date: Date };
      } = {};
      for (const m of measurements) {
        const date = new Date(m.createdAt);
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!groupedByMonth[yearMonth]) {
          groupedByMonth[yearMonth] = { weights: [], date };
        }
        groupedByMonth[yearMonth].weights.push(m.weightKg);
      }
      for (const [yearMonth, group] of Object.entries(groupedByMonth)) {
        const avg =
          group.weights.reduce((sum, w) => sum + w, 0) / group.weights.length;
        monthlyAverages.push({
          month: yearMonth,
          averageWeightKg: avg,
          date: group.date,
        });
      }

      // Calculate rate of change (kg/week)
      const first = measurements[0];
      const last = measurements[measurements.length - 1];
      const daysDiff =
        (new Date(last.createdAt).getTime() -
          new Date(first.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      const rateOfChange =
        daysDiff > 0 ? (last.weightKg - first.weightKg) / (daysDiff / 7) : null;

      // Linear regression for trend line
      const x = measurements.map((_, i) => i);
      const y = measurements.map((m) => m.weightKg);
      const n = x.length;
      const sumX = x.reduce((sum, v) => sum + v, 0);
      const sumY = y.reduce((sum, v) => sum + v, 0);
      const sumXY = x.reduce((sum, v, i) => sum + v * y[i], 0);
      const sumXX = x.reduce((sum, v) => sum + v * v, 0);
      const slope =
        n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
      const intercept = n > 1 ? (sumY - slope * sumX) / n : y[0] || 0;
      const trendPoints = measurements.map((m, i) => ({
        x: new Date(m.createdAt),
        y: intercept + slope * i,
      }));

      return {
        weeklyAverages: weeklyAverages.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        ),
        monthlyAverages: monthlyAverages.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        ),
        rateOfChange,
        trendPoints,
        trendSlope: slope,
      };
    }),

  exportWeights: protectedProcedure.query(async ({ ctx }) => {
    const measurements = await ctx.prisma.weightMeasurement.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "asc" },
      select: { weightKg: true, note: true, createdAt: true },
    });
    return measurements.map((m) => ({
      date: m.createdAt.toISOString(),
      weightKg: m.weightKg,
      note: m.note || "",
    }));
  }),

  sendProgressEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const measurements = await ctx.prisma.weightMeasurement.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "asc" },
      select: { weightKg: true, createdAt: true },
    });
    if (measurements.length < 2) return { message: "Not enough data" };
    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const daysDiff =
      (new Date(last.createdAt).getTime() -
        new Date(first.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const rateOfChange =
      daysDiff > 0 ? (last.weightKg - first.weightKg) / (daysDiff / 7) : null;
    await sendEmail({
      to: ctx.user!.email,
      subject: "Weekly Weight Progress",
      html: `<p>Your weight change this week: ${
        rateOfChange?.toFixed(2) || "N/A"
      } kg/week</p>`,
    });
    return { message: "Progress email sent" };
  }),
});

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("Received request:", {
    method: event.httpMethod,
    path: event.path,
    body: event.body,
    headers: event.headers,
    query: event.queryStringParameters,
  });

  let body;
  try {
    if (event.body) {
      console.log("Decoding body:", event.body);
      try {
        body = event.isBase64Encoded
          ? JSON.parse(Buffer.from(event.body, "base64").toString())
          : JSON.parse(event.body);
        console.log("Parsed body:", body);
      } catch (parseError) {
        console.error("Body parsing error:", parseError);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid request body" }),
        };
      }
    } else {
      console.log("No body, checking query parameters");
      if (event.queryStringParameters?.input) {
        try {
          body = JSON.parse(event.queryStringParameters.input);
          console.log("Parsed query input:", body);
        } catch (parseError) {
          console.error("Query parameter parsing error:", parseError);
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid query parameters" }),
          };
        }
      } else {
        body = undefined;
        console.log("No query input provided");
      }
    }
  } catch (error) {
    console.error("Unexpected error in request parsing:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }

  // Convert event.headers to HeadersInit
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(event.headers || {})) {
    if (value !== undefined) {
      headers[key] = value;
    }
  }

  // Construct the URL from event.path and queryStringParameters
  let queryString = "";
  if (event.queryStringParameters) {
    const validParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(event.queryStringParameters)) {
      if (value !== undefined) {
        validParams[key] = value;
      }
    }
    queryString = new URLSearchParams(validParams).toString();
  }
  const url = `https://${event.headers.host || "localhost"}${event.path}${queryString ? `?${queryString}` : ""}`;

  // Define context inline
  const trpcContext: TRPCContext = {
    event,
    context,
    prisma,
    user: undefined,
  };

  // Extract user from JWT
  const authHeader = event.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      trpcContext.user = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
      };
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }

  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(url, {
        method: event.httpMethod,
        headers,
        body: event.httpMethod !== "GET" ? JSON.stringify(body) : undefined,
      }),
      router: appRouter,
      createContext: () => Promise.resolve(trpcContext),
      onError: ({ error, path, input }) => {
        console.error(`tRPC error on path "${path}":`, { error, input });
      },
    });

    // Convert fetch response to Netlify response
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export type AppRouter = typeof appRouter;
