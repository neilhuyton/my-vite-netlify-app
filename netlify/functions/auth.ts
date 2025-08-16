// netlify/functions/auth.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { prisma } from "./config";

export type UserContext = { id: string; email: string };

export interface TRPCContext {
  event: HandlerEvent;
  context: HandlerContext;
  prisma: typeof prisma;
  user?: UserContext;
}

export const t = initTRPC.context<TRPCContext>().create();

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});