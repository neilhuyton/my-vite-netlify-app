// src/components/WeightChart.tsx
import { Box, Typography } from "@mui/material";
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { trpc } from "../trpc";
import { GetWeightsResponse } from "../types";

// Register Chart.js components
ChartJS.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

export default function WeightChart() {
  const { data, isLoading, isError, error } = trpc.getWeights.useQuery(undefined, {
    select: (data) => data as GetWeightsResponse,
  });

  if (isLoading) return <Box>Loading...</Box>;
  if (isError) return <Box>Error: {error.message}</Box>;
  if (!data) return <Box>No data available</Box>;

  const measurements = data.measurements.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = {
    datasets: [
      {
        label: "Weight (kg)",
        data: measurements.map((m) => ({ x: new Date(m.createdAt), y: m.weightKg })),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const, tooltipFormat: "MMM d, yyyy" },
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "Weight (kg)" },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: (ctx: any) => `Weight: ${ctx.parsed.y} kg` } },
    },
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Weight Trend
      </Typography>
      <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
        <Chart type="line" data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
}