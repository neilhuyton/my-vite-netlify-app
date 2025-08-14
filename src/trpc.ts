// src/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, createTRPCProxyClient } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import { AppRouter } from "../netlify/functions/trpc";

// Initialize tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// Create the tRPC client
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});

// Create a single QueryClient instance
export const queryClient = new QueryClient();
