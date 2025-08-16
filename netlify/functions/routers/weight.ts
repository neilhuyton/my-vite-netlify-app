// netlify/functions/routers/weight.ts
import { t, protectedProcedure } from "../auth";
import { z } from "zod";
import { prisma } from "../config";

export const weightRouter = t.router({
  getWeights: protectedProcedure
    .input(z.object({ timeRange: z.enum(["30d", "90d", "all"]).default("all") }))
    .query(async ({ input, ctx }) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const where =
        input.timeRange === "30d"
          ? { createdAt: { gte: thirtyDaysAgo } }
          : input.timeRange === "90d"
          ? { createdAt: { gte: ninetyDaysAgo } }
          : {};

      const measurements = await ctx.prisma.weightMeasurement.findMany({
        where: {
          userId: ctx.user!.id,
          ...where,
        },
        orderBy: { createdAt: "desc" },
      });

      return { measurements };
    }),

  addWeight: protectedProcedure
    .input(z.object({ weightKg: z.number().positive(), note: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const measurement = await ctx.prisma.weightMeasurement.create({
        data: {
          userId: ctx.user!.id,
          weightKg: input.weightKg,
          note: input.note,
          createdAt: new Date(),
        },
      });
      return { message: "Weight added successfully", measurement };
    }),

  deleteWeight: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.weightMeasurement.delete({
        where: { id: input.id, userId: ctx.user!.id },
      });
      return { message: "Weight deleted successfully" };
    }),
});