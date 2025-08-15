// src/components/TrendSummary.tsx
import { Box, Typography, Paper, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { trpc } from "../trpc";

export default function TrendSummary() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const { data, isLoading, isError, error } = trpc.getWeightTrends.useQuery();

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading trends...</Box>;
  if (isError)
    return <Box sx={{ p: 2, textAlign: "center" }}>Error: {error.message}</Box>;
  if (!data?.weeklyAverages.length)
    return <Box sx={{ p: 2, textAlign: "center" }}>No trend data</Box>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Weight Trends
      </Typography>
      <Select
        value={view}
        onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
        sx={{ mb: 1 }}
        aria-label="Select trend view"
      >
        <MenuItem value="weekly">Weekly</MenuItem>
        <MenuItem value="monthly">Monthly</MenuItem>
      </Select>
      <Paper sx={{ p: 2 }} aria-label="Weight trend summary">
        <Typography variant="body1" sx={{ mb: 1 }}>
          Rate of Change:{" "}
          {data.rateOfChange
            ? `${data.rateOfChange.toFixed(2)} kg/week`
            : "Not enough data"}
        </Typography>
        <Typography variant="body2">
          {view === "weekly" ? "Weekly" : "Monthly"} Averages:
        </Typography>
        {(view === "weekly" ? data.weeklyAverages : data.monthlyAverages).map(
          (item) => (
            <Typography
              key={"week" in item ? item.week : item.month}
              variant="body2"
              sx={{ ml: 2 }}
            >
              {"week" in item ? item.week : item.month}:{" "}
              {item.averageWeightKg.toFixed(1)} kg
            </Typography>
          )
        )}
      </Paper>
    </Box>
  );
}
