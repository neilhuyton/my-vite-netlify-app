// src/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "netlify/functions/trpc";
import { QueryClient } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>();
export const queryClient = new QueryClient();

export const createTRPCClient = (token: string | null, logout: () => void) => {
  return trpc.createClient({
    links: [
      httpLink({
        url: "/api/trpc",
        headers: () => (token ? { Authorization: `Bearer ${token}` } : {}),
        fetch: async (url, options) => {
          const response = await fetch(url, options);
          if (response.status === 401) {
            logout(); // Clear user and token
            // Throw a specific error to signal the need for navigation
            throw new Error("UNAUTHORIZED");
          }
          return response;
        },
      }),
    ],
  });
};