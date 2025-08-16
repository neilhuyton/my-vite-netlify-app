// netlify/functions/routers/weight.ts
import { t, TRPCContext, protectedProcedure } from "../auth";
import { z } from "zod";
import { prisma } from "../config";

export const weightRouter = t.router({
  addWeight: protectedProcedure
    .input(z.object({ weightKg: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => ({
      message: "Weight added",
      measurement: await ctx.prisma.weightMeasurement.create({
        data: {
          weightKg: input.weightKg,
          note: input.note,
          userId: ctx.user!.id,
        },
      }),
    })),

  deleteWeight: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.weightMeasurement.delete({
        where: { id: input.id, userId: ctx.user!.id },
      });
      return { message: "Weight deleted" };
    }),

  getWeights: protectedProcedure
    .input(z.object({ timeRange: z.enum(["30d", "90d", "all"]).optional() }))
    .query(async ({ ctx, input }) => {
      const timeFilter = input.timeRange
        ? {
            createdAt: {
              gte: new Date(
                Date.now() -
                  (input.timeRange === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000
              ),
            },
          }
        : {};
      const measurements = await ctx.prisma.weightMeasurement.findMany({
        where: { userId: ctx.user!.id, ...timeFilter },
        orderBy: { createdAt: "desc" },
        select: { id: true, weightKg: true, note: true, createdAt: true },
      });
      return { measurements };
    }),

  exportWeights: protectedProcedure.query(async ({ ctx }) => {
    const measurements = await ctx.prisma.weightMeasurement.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "asc" },
      select: { weightKg: true, note: true, createdAt: true },
    });
    return measurements.map((m) => ({
      date: m.createdAt.toISOString(),
      weightKg: m.weightKg,
      note: m.note || "",
    }));
  }),
});