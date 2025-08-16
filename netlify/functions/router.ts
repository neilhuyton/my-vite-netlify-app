// netlify/functions/router.ts
import { initTRPC } from "@trpc/server";
import { authRouter, TRPCContext } from "./routers/auth";
import { weightRouter } from "./routers/weight";
import { goalRouter } from "./routers/goal";
import { trendRouter } from "./routers/trend";
import { accountRouter } from "./routers/account"; // Import account router

const t = initTRPC.context<TRPCContext>().create();

export const appRouter = t.router({
  auth: authRouter,
  weight: weightRouter,
  goal: goalRouter,
  trend: trendRouter,
  account: accountRouter, // Add account router
});

export type AppRouter = typeof appRouter;
export { TRPCContext };