// src/trpc.ts
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "../netlify/functions/router";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const trpc = createTRPCReact<AppRouter>();

export const createTRPCClient = (token: string | null, onUnauthorized: () => void) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: import.meta.env.VITE_API_URL || "/api/trpc",
        headers: () => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          console.log("tRPC headers:", headers);
          return headers;
        },
        fetch: async (url, options) => {
          console.log("tRPC request:", { url, options });
          const response = await fetch(url, options);
          const responseText = await response.text();
          console.log("tRPC response:", { status: response.status, body: responseText });
          if (response.status === 401) {
            console.log("tRPC: Received 401 Unauthorized");
            onUnauthorized();
            throw new Error("UNAUTHORIZED");
          }
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${responseText}`);
          }
          return new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        },
      }),
    ],
  });
};