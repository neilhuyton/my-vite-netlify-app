// src/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "netlify/functions/trpc";
import { QueryClient } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>();
export const queryClient = new QueryClient();