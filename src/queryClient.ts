// src/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for failed queries
      refetchOnWindowFocus: false, // Disable refetching on window focus
    },
  },
});
