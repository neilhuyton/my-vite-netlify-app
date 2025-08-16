import { initTRPC } from "@trpc/server";
import { authRouter, TRPCContext } from "./routers/auth"; // Import TRPCContext
import { weightRouter } from "./routers/weight";
import { goalRouter } from "./routers/goal";
import { trendRouter } from "./routers/trend";

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  auth: authRouter,
  weight: weightRouter,
  goal: goalRouter,
  trend: trendRouter,
});

export type AppRouter = typeof appRouter;
export { TRPCContext }; // Re-export TRPCContext