// netlify/functions/routers/goal.ts
import { t, protectedProcedure } from "../auth";
import { z } from "zod";

export const goalRouter = t.router({
  setGoal: protectedProcedure
    .input(
      z.object({
        goalWeightKg: z.number().positive(),
        startWeightKg: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.prisma.goal.upsert({
        where: { userId: ctx.user!.id },
        update: {
          goalWeightKg: input.goalWeightKg,
          startWeightKg: input.startWeightKg,
          goalSetAt: new Date(),
        },
        create: {
          userId: ctx.user!.id,
          goalWeightKg: input.goalWeightKg,
          startWeightKg: input.startWeightKg,
          goalSetAt: new Date(),
        },
      });
      return {
        message: "Goal set successfully",
        goalWeightKg: goal.goalWeightKg,
      };
    }),

  getGoal: protectedProcedure.query(async ({ ctx }) => {
    const goal = await ctx.prisma.goal.findUnique({
      where: { userId: ctx.user!.id },
      select: { goalWeightKg: true, goalSetAt: true, startWeightKg: true },
    });
    const latestWeight = await ctx.prisma.weightMeasurement.findFirst({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "desc" },
      select: { weightKg: true },
    });
    return {
      goalWeightKg: goal?.goalWeightKg ?? null,
      goalSetAt: goal?.goalSetAt ?? null,
      startWeightKg: goal?.startWeightKg ?? null,
      latestWeightKg: latestWeight?.weightKg ?? null,
    };
  }),

  clearGoal: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.goal.deleteMany({ where: { userId: ctx.user!.id } });
    return { message: "Goal cleared successfully" };
  }),
});
