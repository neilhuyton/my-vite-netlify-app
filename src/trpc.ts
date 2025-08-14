// src/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'netlify/functions/trpc';
import { QueryClient } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';

// Create the tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Create a QueryClient for React Query
export const queryClient = new QueryClient();

// Create the tRPC client instance
export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: '/api/trpc', // Matches the redirect in netlify.toml
    }),
  ],
});