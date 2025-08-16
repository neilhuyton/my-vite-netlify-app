// src/components/GoalContent.tsx
import { useState } from "react";
import { Box, Alert } from "@mui/material";
import GoalForm from "./GoalForm";
import GoalProgress from "./GoalProgress";
import ClearGoalDialog from "./ClearGoalDialog";
import { useGoalMutations } from "../hooks/useGoalMutations";

export default function GoalContent() {
  const [goalWeight, setGoalWeight] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [openClearGoalDialog, setOpenClearGoalDialog] = useState(false);
  const { goalData, setGoal, clearGoal, error, setError } = useGoalMutations();

  const handleGoalSubmit = (goalValue: string, startValue: string) => {
    const goalWeightValue = parseFloat(goalValue);
    const startWeightValue = parseFloat(startValue);
    if (isNaN(goalWeightValue) || goalWeightValue <= 0) {
      setError("Invalid goal weight");
      return;
    }
    if (isNaN(startWeightValue) || startWeightValue <= 0) {
      setError("Invalid starting weight");
      return;
    }
    setGoal.mutate({
      goalWeightKg: goalWeightValue,
      startWeightKg: startWeightValue,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <GoalForm
        goalWeight={goalWeight}
        setGoalWeight={setGoalWeight}
        startWeight={startWeight}
        setStartWeight={setStartWeight}
        error={error}
        isPending={setGoal.isPending}
        isSuccess={setGoal.isSuccess}
        successMessage={setGoal.data?.message}
        onSubmit={handleGoalSubmit}
      />
      <GoalProgress
        goalData={goalData}
        onClearGoalClick={() => setOpenClearGoalDialog(true)}
        isPending={clearGoal.isPending}
      />
      <ClearGoalDialog
        open={openClearGoalDialog}
        onClose={() => setOpenClearGoalDialog(false)}
        onConfirm={() => {
          setOpenClearGoalDialog(false);
          clearGoal.mutate();
        }}
      />
    </Box>
  );
}
