// netlify/functions/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Store in .env

type TRPCContext = {
  event: HandlerEvent;
  context: HandlerContext;
  prisma: PrismaClient;
  user?: { id: number; email: string };
};

const t = initTRPC.context<TRPCContext>().create();

// Middleware to check JWT
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const token = ctx.event.headers.authorization?.split("Bearer ")[1];
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    return next({ ctx: { ...ctx, user: decoded } });
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }
});

// Protected procedure
const protectedProcedure = t.procedure.use(isAuthenticated);

export const appRouter = t.router({
  signup: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (existingUser) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await prisma.user.create({
        data: { email: input.email, password: hashedPassword },
      });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      return { token, user: { id: user.id, email: user.email } };
    }),

  login: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      return { token, user: { id: user.id, email: user.email } };
    }),

  getWeights: protectedProcedure.query(async ({ ctx }) => ({
    measurements: await ctx.prisma.weightMeasurement.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "desc" },
    }),
  })),

  addWeight: protectedProcedure
    .input(z.object({ weightKg: z.number() }))
    .mutation(async ({ ctx, input }) => ({
      message: "Weight added",
      measurement: await ctx.prisma.weightMeasurement.create({
        data: { weightKg: input.weightKg, userId: ctx.user!.id },
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
    const headers = new Headers(Object.entries(event.headers).filter(([, v]) => typeof v === "string") as [string, string][]);
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(`https://${event.headers.host ?? "localhost"}${event.path}`, {
        method: event.httpMethod,
        headers,
        body: ["POST", "PUT"].includes(event.httpMethod) ? event.body : undefined,
      }),
      router: appRouter,
      createContext: () => ({ event, context, prisma }),
    });

    return {
      statusCode: response.status,
      headers: { ...Object.fromEntries(response.headers), "Access-Control-Allow-Origin": "*" },
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