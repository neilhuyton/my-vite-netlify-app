// src/components/TrendSummary.tsx
import { Box, Typography, Paper } from "@mui/material";
import { trpc } from "../trpc";

export default function TrendSummary() {
  const { data, isLoading, isError, error } = trpc.getWeightTrends.useQuery();

  if (isLoading) return <Box sx={{ p: 2, textAlign: "center" }}>Loading trends...</Box>;
  if (isError) return <Box sx={{ p: 2, textAlign: "center" }}>Error: {error.message}</Box>;
  if (!data?.weeklyAverages.length) return <Box sx={{ p: 2, textAlign: "center" }}>No trend data</Box>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Weight Trends</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Rate of Change: {data.rateOfChange ? `${data.rateOfChange.toFixed(2)} kg/week` : "Not enough data"}
        </Typography>
        <Typography variant="body2">Weekly Averages:</Typography>
        {data.weeklyAverages.map((week) => (
          <Typography key={week.week} variant="body2" sx={{ ml: 2 }}>
            {week.week}: {week.averageWeightKg.toFixed(1)} kg
          </Typography>
        ))}
      </Paper>
    </Box>
  );
}