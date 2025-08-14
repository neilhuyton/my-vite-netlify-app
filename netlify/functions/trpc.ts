import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
const t = initTRPC.context<{ event: HandlerEvent; context: HandlerContext; prisma: PrismaClient }>().create();

export const appRouter = t.router({
  getWeights: t.procedure.query(async ({ ctx }) => ({
    measurements: await ctx.prisma.weightMeasurement.findMany({ orderBy: { createdAt: "desc" } }),
  })),
  addWeight: t.procedure
    .input(z.object({ weightKg: z.number() }))
    .mutation(async ({ ctx, input }) => ({
      message: "Weight added",
      measurement: await ctx.prisma.weightMeasurement.create({ data: { weightKg: input.weightKg } }),
    })),
  deleteWeight: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => ctx.prisma.weightMeasurement.delete({ where: { id: input.id } })),
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