// src/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'netlify/functions/trpc';
import { QueryClient } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: '/api/trpc',
    }),
  ],
});