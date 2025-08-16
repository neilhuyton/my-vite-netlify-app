// src/components/WeightChart.tsx
import { useEffect, useState } from "react";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { trpc } from "../trpc";
import annotationPlugin from "chartjs-plugin-annotation";
import type { AnnotationOptions } from "chartjs-plugin-annotation";
import { useStore } from "../store";
import type { AppRouter } from "../../netlify/functions/router";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export type WeightMeasurement = {
  id: string;
  weightKg: number;
  createdAt: string;
  note?: string | null;
};
export type GetWeightsResponse = { measurements: WeightMeasurement[] };
export type GoalData = {
  goalWeightKg: number | null;
  startWeightKg: number | null;
  goalSetAt?: string | null;
  latestWeightKg?: number | null;
};
export type TrendPoint = { x: string; y: number };
export type GetWeightTrendsResponse = {
  trendPoints?: TrendPoint[];
  trendSlope?: number | null;
  weeklyAverages?: { week?: string; date?: string; averageWeightKg: number }[];
  monthlyAverages?: {
    month?: string;
    date?: string;
    averageWeightKg: number;
  }[];
  rateOfChange?: number | null;
};

export default function WeightChart() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("all");
  const { setMeasurements, setGoal, setTrends } = useStore();

  const {
    data: weightsData,
    isLoading,
    isError,
    error,
  } = trpc.weight.getWeights.useQuery(
    { timeRange },
    { enabled: !!useStore.getState().user?.token }
  );
  const { data: goalData } = trpc.goal.getGoal.useQuery(undefined, {
    enabled: !!weightsData,
  });
  const { data: trendData } = trpc.trend.getWeightTrends.useQuery(
    { timeRange },
    { enabled: !!weightsData }
  );

  // Update Zustand store when data changes
  useEffect(() => {
    if (weightsData) {
      setMeasurements(weightsData.measurements);
    }
  }, [weightsData, setMeasurements]);

  useEffect(() => {
    if (goalData) {
      setGoal(goalData);
    }
  }, [goalData, setGoal]);

  useEffect(() => {
    if (trendData) {
      setTrends(trendData);
    }
  }, [trendData, setTrends]);

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading...</Box>;
  if (isError)
    return <Box sx={{ p: 2, textAlign: "center" }}>Error: {error.message}</Box>;
  if (!weightsData?.measurements?.length)
    return <Box sx={{ p: 2, textAlign: "center" }}>No data</Box>;

  const measurements = weightsData.measurements.sort(
    (a: WeightMeasurement, b: WeightMeasurement) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const trendLineColor =
    trendData?.trendSlope && trendData.trendSlope < 0 ? "green" : "red";

  const chartData: ChartData<"line", { x: Date; y: number }[], string> = {
    datasets: [
      {
        label: "Weight (kg)",
        data: measurements.map((m: WeightMeasurement) => ({
          x: new Date(m.createdAt),
          y: m.weightKg,
        })),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Trend Line",
        data: (trendData?.trendPoints || []).map((p: TrendPoint) => ({
          x: new Date(p.x),
          y: p.y,
        })),
        borderColor: trendLineColor,
        backgroundColor: `${trendLineColor}33`,
        fill: false,
        tension: 0.1,
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  };

  const annotations: AnnotationOptions<"line">[] =
    goalData?.goalWeightKg != null
      ? [
          {
            type: "line",
            yMin: goalData.goalWeightKg,
            yMax: goalData.goalWeightKg,
            borderColor: "red",
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: `Goal: ${goalData.goalWeightKg} kg`,
              position: "start",
              backgroundColor: "rgba(255, 0, 0, 0.7)",
              font: { size: 12 },
            },
          },
        ]
      : [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const, tooltipFormat: "MMM d, yyyy" },
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "Weight (kg)" },
        beginAtZero: false,
        min:
          goalData?.goalWeightKg != null
            ? Math.min(
                goalData.goalWeightKg - 5,
                ...measurements.map((m: WeightMeasurement) => m.weightKg)
              )
            : undefined,
        max:
          goalData?.goalWeightKg != null
            ? Math.max(
                goalData.goalWeightKg + 5,
                ...measurements.map((m: WeightMeasurement) => m.weightKg)
              )
            : undefined,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) =>
            `${ctx.dataset.label}: ${ctx.parsed.y} kg`,
        },
      },
      annotation: { annotations },
    },
  };

  return (
    <Box sx={{ mt: 2, height: { xs: 300, sm: 400 } }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Weight Trend
      </Typography>
      <Select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value as "30d" | "90d" | "all")}
        sx={{ mb: 1 }}
        aria-label="Select time range"
      >
        <MenuItem value="30d">Last 30 Days</MenuItem>
        <MenuItem value="90d">Last 90 Days</MenuItem>
        <MenuItem value="all">All Time</MenuItem>
      </Select>
      <Chart
        type="line"
        data={chartData}
        options={chartOptions}
        aria-label="Weight trend chart with goal line and trend line"
      />
    </Box>
  );
}
