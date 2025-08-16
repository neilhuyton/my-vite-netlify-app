// src/components/GoalProgress.tsx
import { Box, Typography, LinearProgress, Button } from "@mui/material";

type GoalData = {
  goalWeightKg: number | null;
  startWeightKg: number | null;
  goalSetAt?: string | null;
  latestWeightKg?: number | null;
};

interface GoalProgressProps {
  goalData: GoalData | undefined;
  onClearGoalClick: () => void;
  isPending: boolean;
}

export default function GoalProgress({
  goalData,
  onClearGoalClick,
  isPending,
}: GoalProgressProps) {
  const progress =
    goalData?.goalWeightKg != null &&
    goalData?.latestWeightKg != null &&
    goalData?.startWeightKg != null &&
    goalData.startWeightKg !== goalData.goalWeightKg
      ? Math.min(
          Math.max(
            ((goalData.startWeightKg - goalData.latestWeightKg) /
              (goalData.startWeightKg - goalData.goalWeightKg)) *
              100,
            0
          ),
          100
        )
      : 0;

  if (!goalData?.goalWeightKg) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1">
        Goal: {goalData.goalWeightKg.toFixed(1)} kg
        {goalData.goalSetAt &&
          ` (Set on ${new Date(goalData.goalSetAt).toLocaleDateString()})`}
      </Typography>
      {goalData.latestWeightKg != null && goalData.startWeightKg != null && (
        <>
          <Typography variant="body1">
            Starting Weight: {goalData.startWeightKg.toFixed(1)} kg
          </Typography>
          <Typography variant="body1">
            Latest Weight: {goalData.latestWeightKg.toFixed(1)} kg
          </Typography>
          <Typography variant="body1">
            Progress to Goal:{" "}
            {Math.abs(goalData.latestWeightKg - goalData.goalWeightKg).toFixed(
              1
            )}{" "}
            kg
            {goalData.latestWeightKg > goalData.goalWeightKg
              ? " to lose"
              : " to gain"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1,
              height: 10,
              bgcolor: "grey.300",
              "& .MuiLinearProgress-bar": { bgcolor: "#1976d2" },
            }}
            aria-label={`Progress to goal: ${progress.toFixed(0)}%`}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {progress.toFixed(0)}% to goal
          </Typography>
        </>
      )}
      <Button
        variant="outlined"
        color="secondary"
        onClick={onClearGoalClick}
        disabled={isPending || !goalData?.goalWeightKg}
        sx={{ mt: 1 }}
      >
        Clear Goal
      </Button>
    </Box>
  );
}
