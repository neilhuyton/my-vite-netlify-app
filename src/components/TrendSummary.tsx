import { useEffect, useState } from "react";
import { Box, Typography, Paper, Select, MenuItem } from "@mui/material";
import { trpc } from "../trpc";
import { useStore } from "../store";

type TrendItem = { week?: string; month?: string; averageWeightKg: number; date?: string };
type GetWeightTrendsResponse = {
  weeklyAverages: TrendItem[];
  monthlyAverages: TrendItem[];
  rateOfChange?: number | null;
  trendSlope?: number | null;
  trendPoints?: { x: string; y: number }[];
};

export default function TrendSummary() {
  const { user, setTrends } = useStore();
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("all");
  const { data, isLoading, isError, error } = trpc.trend.getWeightTrends.useQuery(
    { timeRange },
    { enabled: !!user?.token }
  );

  // Update Zustand store when data is fetched
  useEffect(() => {
    if (data) {
      setTrends(data);
    }
  }, [data, setTrends]);

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading...</Box>;
  if (isError)
    return <Box sx={{ p: 2, textAlign: "center" }}>Error: {error.message}</Box>;
  if (!data?.weeklyAverages?.length)
    return <Box sx={{ p: 2, textAlign: "center" }}>No data</Box>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Weight Trends
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <Select
          value={view}
          onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
        >
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </Select>
        <Select
          value={timeRange}
          onChange={(e) =>
            setTimeRange(e.target.value as "30d" | "90d" | "all")
          }
        >
          <MenuItem value="30d">Last 30 Days</MenuItem>
          <MenuItem value="90d">Last 90 Days</MenuItem>
          <MenuItem value="all">All Time</MenuItem>
        </Select>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Rate of Change:{" "}
          {data.rateOfChange !== undefined && data.rateOfChange !== null
            ? `${data.rateOfChange.toFixed(2)} kg/week`
            : "N/A"}
        </Typography>
        <Typography variant="body2">
          {view === "weekly" ? "Weekly" : "Monthly"} Averages:
        </Typography>
        {(view === "weekly" ? data.weeklyAverages : data.monthlyAverages).map(
          (item: TrendItem) => (
            <Typography
              key={"week" in item ? item.week : item.month}
              variant="body2"
              sx={{ ml: 2 }}
            >
              {("week" in item ? item.week : item.month) || item.date || "Unknown"}:{" "}
              {item.averageWeightKg.toFixed(1)} kg
            </Typography>
          )
        )}
      </Paper>
    </Box>
  );
}