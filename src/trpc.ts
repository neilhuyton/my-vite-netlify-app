// src/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../netlify/functions/router"; // Correct import path
import { QueryClient } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>();
export const queryClient = new QueryClient();

export const createTRPCClient = (token: string | null, logout: () => void) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: import.meta.env.VITE_API_URL || "/api/trpc",
        headers: () => ({
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        }),
        fetch: async (url, options) => {
          console.log("tRPC request:", { url, options });
          const urlString = typeof url === "string" ? url : url.toString();
          const isQuery =
            urlString.includes("getWeightTrends") ||
            urlString.includes("getWeights") ||
            urlString.includes("getGoal");
          const method = isQuery ? "GET" : "POST";
          const response = await fetch(url, {
            ...options,
            method,
            headers: {
              ...options?.headers,
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: method === "GET" ? undefined : options?.body,
          });
          const responseText = await response.text();
          console.log("Raw response:", responseText);
          if (response.status === 401) {
            logout();
            throw new Error("UNAUTHORIZED");
          }
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${responseText}`);
          }
          try {
            return new Response(responseText, {
              status: response.status,
              headers: response.headers,
            });
          } catch (error) {
            console.error("Failed to parse response as JSON:", error, responseText);
            throw error;
          }
        },
      }),
    ],
  });
};