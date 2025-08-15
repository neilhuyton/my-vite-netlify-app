// src/components/WeightChart.tsx
import { Box, Typography } from "@mui/material";
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
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { trpc } from "../trpc";
import annotationPlugin from "chartjs-plugin-annotation";
import type { AnnotationOptions } from "chartjs-plugin-annotation";

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

export default function WeightChart() {
  const {
    data: weightsData,
    isLoading,
    isError,
    error,
  } = trpc.getWeights.useQuery();
  const { data: goalData } = trpc.getGoal.useQuery(undefined, {
    enabled: !!weightsData,
  });
  const { data: trendData } = trpc.getWeightTrends.useQuery(undefined, {
    enabled: !!weightsData,
  });

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading...</Box>;
  if (isError)
    return <Box sx={{ p: 2, textAlign: "center" }}>Error: {error.message}</Box>;
  if (!weightsData?.measurements.length)
    return <Box sx={{ p: 2, textAlign: "center" }}>No data</Box>;

  const measurements = weightsData.measurements.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const trendLineColor =
    trendData?.trendSlope && trendData.trendSlope < 0 ? "green" : "red";

  const chartData: ChartData<"line", { x: Date; y: number }[], string> = {
    datasets: [
      {
        label: "Weight (kg)",
        data: measurements.map((m) => ({
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
        data: (trendData?.trendPoints || []).map((p) => ({
          x: new Date(p.x),
          y: p.y,
        })),
        borderColor: trendLineColor,
        backgroundColor: `${trendLineColor}33`, // 20% opacity
        fill: false,
        tension: 0.1,
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  };

  const annotations: AnnotationOptions<"line">[] = goalData?.goalWeightKg
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
        min: goalData?.goalWeightKg
          ? Math.min(
              goalData.goalWeightKg - 5,
              ...measurements.map((m) => m.weightKg)
            )
          : undefined,
        max: goalData?.goalWeightKg
          ? Math.max(
              goalData.goalWeightKg + 5,
              ...measurements.map((m) => m.weightKg)
            )
          : undefined,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y} kg`,
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
      <Chart
        type="line"
        data={chartData}
        options={chartOptions}
        aria-label="Weight trend chart with goal line and trend line"
      />
    </Box>
  );
}
