// netlify/functions/routers/trend.ts
import { t, TRPCContext, protectedProcedure } from "../auth";
import { z } from "zod";
import { prisma } from "../config";
import { sendEmail } from "../email";

export const trendRouter = t.router({
  getWeightTrends: protectedProcedure
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
        orderBy: { createdAt: "asc" },
        select: { weightKg: true, createdAt: true },
      });

      if (!measurements.length) {
        return {
          weeklyAverages: [],
          monthlyAverages: [],
          rateOfChange: null,
          trendPoints: [],
          trendSlope: null,
        };
      }

      const weeklyAverages = calculateAverages(
        measurements,
        "week",
        (date) =>
          `${date.getFullYear()}-W${
            Math.floor((date.getDate() + ((date.getDay() + 6) % 7)) / 7) + 1
          }`
      );
      const monthlyAverages = calculateAverages(
        measurements,
        "month",
        (date) => `${date.getFullYear()}-${date.getMonth() + 1}`
      );

      const first = measurements[0];
      const last = measurements[measurements.length - 1];
      const daysDiff =
        (new Date(last.createdAt).getTime() -
          new Date(first.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      const rateOfChange =
        daysDiff > 0 ? (last.weightKg - first.weightKg) / (daysDiff / 7) : null;

      const { trendPoints, trendSlope } = calculateTrendLine(measurements);

      return {
        weeklyAverages: weeklyAverages.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        ),
        monthlyAverages: monthlyAverages.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        ),
        rateOfChange,
        trendPoints,
        trendSlope,
      };
    }),

  sendProgressEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const measurements = await ctx.prisma.weightMeasurement.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { createdAt: "asc" },
      select: { weightKg: true, createdAt: true },
    });
    if (measurements.length < 2) return { message: "Not enough data" };

    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const daysDiff =
      (new Date(last.createdAt).getTime() -
        new Date(first.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const rateOfChange =
      daysDiff > 0 ? (last.weightKg - first.weightKg) / (daysDiff / 7) : null;

    await sendEmail({
      to: ctx.user!.email,
      subject: "Weekly Weight Progress",
      html: `<p>Your weight change this week: ${
        rateOfChange?.toFixed(2) ?? "N/A"
      } kg/week</p>`,
    });
    return { message: "Progress email sent" };
  }),
});

function calculateAverages(
  measurements: { weightKg: number; createdAt: Date }[],
  period: "week" | "month",
  getKey: (date: Date) => string
) {
  const grouped: { [key: string]: { weights: number[]; date: Date } } = {};
  for (const m of measurements) {
    const date = new Date(m.createdAt);
    const key = getKey(date);
    if (!grouped[key]) grouped[key] = { weights: [], date };
    grouped[key].weights.push(m.weightKg);
  }

  return Object.entries(grouped).map(([key, group]) => ({
    [period]: key,
    averageWeightKg:
      group.weights.reduce((sum, w) => sum + w, 0) / group.weights.length,
    date: group.date,
  }));
}

function calculateTrendLine(
  measurements: { weightKg: number; createdAt: Date }[]
) {
  const x = measurements.map((_, i) => i);
  const y = measurements.map((m) => m.weightKg);
  const n = x.length;
  const sumX = x.reduce((sum, v) => sum + v, 0);
  const sumY = y.reduce((sum, v) => sum + v, 0);
  const sumXY = x.reduce((sum, v, i) => sum + v * y[i], 0);
  const sumXX = x.reduce((sum, v) => sum + v * v, 0);
  const slope =
    n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
  const intercept = n > 1 ? (sumY - slope * sumX) / n : y[0] || 0;

  return {
    trendPoints: measurements.map((m, i) => ({
      x: new Date(m.createdAt),
      y: intercept + slope * i,
    })),
    trendSlope: slope,
  };
}
