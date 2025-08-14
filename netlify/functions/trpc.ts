// netlify/functions/trpc.ts
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

type TRPCContext = {
  event: HandlerEvent;
  context: HandlerContext;
  prisma: PrismaClient;
};

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  getWeights: t.procedure.query(async ({ ctx }) => {
    try {
      const measurements = await ctx.prisma.weightMeasurement.findMany({
        orderBy: { createdAt: "desc" },
      });
      return {
        message: "Weight measurements retrieved successfully!",
        measurements,
      };
    } catch (error) {
      console.error("Prisma query error:", error);
      throw new Error("Failed to fetch weight measurements");
    }
  }),
  addWeight: t.procedure
    .input(
      z.object({
        weightKg: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Received addWeight input:", input); // Debug
      try {
        const measurement = await ctx.prisma.weightMeasurement.create({
          data: {
            weightKg: input.weightKg,
          },
        });
        return {
          message: "Weight measurement added successfully!",
          measurement,
        };
      } catch (error) {
        console.error("Prisma create error:", error);
        throw new Error("Failed to add weight measurement");
      }
    }),
});

export const handler = async (
  handlerEvent: HandlerEvent,
  context: HandlerContext
) => {
  console.log("Raw handler event:", handlerEvent); // Debug
  console.log("Request body:", handlerEvent.body); // Debug
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(handlerEvent.headers)) {
      if (typeof value === "string") {
        headers.append(key, value);
      }
    }

    const requestOptions: RequestInit = {
      method: handlerEvent.httpMethod,
      headers,
    };
    if (
      handlerEvent.httpMethod === "POST" ||
      handlerEvent.httpMethod === "PUT"
    ) {
      requestOptions.body = handlerEvent.body ?? undefined;
    }

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(
        `https://${handlerEvent.headers.host ?? "localhost"}${
          handlerEvent.path
        }`,
        requestOptions
      ),
      router: appRouter,
      createContext: () => ({ event: handlerEvent, context, prisma }),
    });

    return {
      statusCode: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        "Access-Control-Allow-Origin": "*",
      },
      body: await response.text(),
    };
  } catch (error) {
    console.error("Function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Internal Server Error",
        details: message,
      }),
    };
  }
};

export type AppRouter = typeof appRouter;
