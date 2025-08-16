// netlify/functions/router.ts
import { t, TRPCContext } from "./auth";
import { authRouter } from "./routers/auth";
import { weightRouter } from "./routers/weight";
import { goalRouter } from "./routers/goal";
import { trendRouter } from "./routers/trend";
import { accountRouter } from "./routers/account";

export const appRouter = t.router({
  auth: authRouter,
  weight: weightRouter,
  goal: goalRouter,
  trend: trendRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
export { TRPCContext };