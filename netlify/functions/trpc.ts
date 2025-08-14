// netlify/functions/trpc.ts
import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { HandlerEvent, HandlerContext } from '@netlify/functions';

// Define the tRPC context
type TRPCContext = {
  event: HandlerEvent;
  context: HandlerContext;
};

// Initialize tRPC
const t = initTRPC.context<TRPCContext>().create();

// Create a router
export const appRouter = t.router({
  hello: t.procedure.query(() => {
    return {
      message: 'Hello from tRPC on Netlify Functions!',
    };
  }),
});

// Export the Netlify Function handler
export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Convert event.headers to HeadersInit
  const headers = new Headers();
  for (const [key, value] of Object.entries(event.headers)) {
    if (value !== undefined) {
      headers.append(key, value);
    }
  }

  // Adapt tRPC fetch handler for Netlify
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: new Request(
      `https://${event.headers.host ?? 'localhost'}${event.path}`,
      {
        method: event.httpMethod,
        headers,
        body: event.body ? event.body : undefined,
      }
    ),
    router: appRouter,
    createContext: () => ({ event, context }),
  });

  // Convert fetch response to Netlify response
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};

// Export the router type for the client
export type AppRouter = typeof appRouter;