// netlify/functions/trpc.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { appRouter, TRPCContext } from "./router";
import { prisma } from "./config";
import { UserContext } from "./routers/auth";
import jwt from "jsonwebtoken";
import { config } from "./config";

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  const body = parseBody(event);
  if ("error" in body) return body;

  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).filter(([, value]) => value !== undefined)
  ) as Record<string, string>;

  console.log("Netlify function headers:", headers);

  const queryString = event.queryStringParameters
    ? new URLSearchParams(
        Object.fromEntries(
          Object.entries(event.queryStringParameters).filter(([, value]) => value !== undefined)
        ) as Record<string, string>
      ).toString()
    : "";
  const url = `https://${event.headers.host || "localhost"}${event.path}${queryString ? `?${queryString}` : ""}`;

  const trpcContext: TRPCContext = {
    event,
    context,
    prisma,
    user: extractUser(event.headers.authorization),
  };

  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(url, {
        method: event.httpMethod,
        headers: {
          ...headers,
          Authorization: headers.authorization || "",
        },
        body: event.httpMethod !== "GET" ? JSON.stringify(body) : undefined,
      }),
      router: appRouter,
      createContext: () => Promise.resolve(trpcContext),
      onError: ({ error, path, input }) => console.error(`tRPC error on path "${path}":`, { error, input }),
    });

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    };
  } catch (error) {
    console.error("Handler error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
  }
};

function parseBody(event: HandlerEvent) {
  if (event.body) {
    try {
      return event.isBase64Encoded
        ? JSON.parse(Buffer.from(event.body, "base64").toString())
        : JSON.parse(event.body);
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
    }
  }

  if (event.queryStringParameters?.input) {
    try {
      return JSON.parse(event.queryStringParameters.input);
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid query parameters" }) };
    }
  }

  return undefined;
}

function extractUser(authHeader?: string): UserContext | undefined {
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("No Bearer token found in Authorization header");
    return undefined;
  }
  const token = authHeader.split(" ")[1];
  console.log("JWT token:", token);
  try {
    const user = jwt.verify(token, config.JWT_SECRET) as UserContext;
    console.log("JWT verified, user:", user);
    return user;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return undefined;
  }
}