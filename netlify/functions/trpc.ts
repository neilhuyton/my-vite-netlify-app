// netlify/functions/trpc.ts
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

console.log("DATABASE_URL in function:", process.env.DATABASE_URL);

type TRPCContext = {
  event: HandlerEvent;
  context: HandlerContext;
  prisma: PrismaClient;
};

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  greet: t.procedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.prisma.user.findMany();
      return {
        message: "Hello from tRPC with Prisma!",
        users,
      };
    } catch (error) {
      console.error("Prisma query error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to fetch users: ${message}`);
    }
  }),
});

export const handler = async (
  handlerEvent: HandlerEvent,
  context: HandlerContext
) => {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(handlerEvent.headers)) {
      if (typeof value === "string") {
        headers.append(key, value);
      }
    }

    // Only include body for methods that support it (e.g., POST, PUT)
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
