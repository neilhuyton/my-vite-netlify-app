// netlify/functions/trpc.ts
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

type TRPCContext = { event: HandlerEvent; context: HandlerContext; prisma: PrismaClient };

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  getWeights: t.procedure.query(async ({ ctx }) => ({
    measurements: await ctx.prisma.weightMeasurement.findMany({
      orderBy: { createdAt: "desc" },
    }),
  })),
  addWeight: t.procedure
    .input(z.object({ weightKg: z.number() }))
    .mutation(async ({ ctx, input }) => ({
      message: "Weight measurement added successfully!",
      measurement: await ctx.prisma.weightMeasurement.create({
        data: { weightKg: input.weightKg },
      }),
    })),
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
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

export type AppRouter = typeof appRouter;