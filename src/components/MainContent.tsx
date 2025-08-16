// src/components/MainContent.tsx
import { useState, useEffect } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import WeightForm from "./WeightForm";
import GoalForm from "./GoalForm";
import TrendSummary from "./TrendSummary";
import GoalProgress from "./GoalProgress";
import DeleteAccountDialog from "./DeleteAccountDialog";
import ClearGoalDialog from "./ClearGoalDialog";
import { useStore } from "../store";
import { trpc, queryClient } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function MainContent() {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [error, setError] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openClearGoalDialog, setOpenClearGoalDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { user, clearUser } = useStore();
  const navigate = useNavigate();

  const { data: goalData, refetch: refetchGoal, error: goalError } = trpc.goal.getGoal.useQuery(
    undefined,
    { enabled: !!user?.token }
  );

  const addWeight = trpc.weight.addWeight.useMutation({
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        setError("Session expired. Please log in again.");
        clearUser();
        navigate({ to: "/login" });
      } else {
        setError(err.message);
      }
    },
  });

  const setGoal = trpc.goal.setGoal.useMutation({
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        setError("Session expired. Please log in again.");
        clearUser();
        navigate({ to: "/login" });
      } else {
        setError(err.message);
      }
    },
  });

  const clearGoal = trpc.goal.clearGoal.useMutation({
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        setError("Session expired. Please log in again.");
        clearUser();
        navigate({ to: "/login" });
      } else {
        setError(err.message);
      }
    },
  });

  const deleteAccount = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      clearUser();
      navigate({ to: "/login" });
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        setError("Session expired. Please log in again.");
        clearUser();
        navigate({ to: "/login" });
      } else {
        setError("Failed to delete account: " + err.message);
      }
    },
  });

  useEffect(() => {
    if (addWeight.isSuccess) {
      setWeight("");
      setNote("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["weight", "getWeights"] });
      queryClient.invalidateQueries({ queryKey: ["trend", "getWeightTrends"] });
      refetchGoal();
      setSnackbarOpen(true);
    }
  }, [addWeight.isSuccess, refetchGoal]);

  useEffect(() => {
    if (setGoal.isSuccess) {
      setGoalWeight("");
      setStartWeight("");
      setError("");
      refetchGoal();
    }
  }, [setGoal.isSuccess, refetchGoal]);

  useEffect(() => {
    if (clearGoal.isSuccess) {
      setError("");
      refetchGoal();
    }
  }, [clearGoal.isSuccess, refetchGoal]);

  useEffect(() => {
    if (goalError?.data?.code === "UNAUTHORIZED") {
      setError("Session expired. Please log in again.");
      clearUser();
      navigate({ to: "/login" });
    }
  }, [goalError, clearUser, navigate]);

  const handleSubmit = (value: string, note?: string) => {
    const weightValue = parseFloat(value);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Invalid weight");
      return;
    }
    addWeight.mutate({ weightKg: weightValue, note });
  };

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
    setGoal.mutate({ goalWeightKg: goalWeightValue, startWeightKg: startWeightValue });
  };

  const handleDeleteAccountClick = () => setOpenDeleteDialog(true);
  const handleClearGoalClick = () => setOpenClearGoalDialog(true);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (!user?.token) return null;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Welcome, {user.email}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={() => {
              clearUser();
              navigate({ to: "/login" });
            }}
          >
            Logout
          </Button>
          <Button color="error" onClick={handleDeleteAccountClick}>
            Delete Account
          </Button>
        </Box>
      </Box>
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
        onClearGoalClick={handleClearGoalClick}
        isPending={clearGoal.isPending}
      />
      <WeightForm
        weight={weight}
        setWeight={setWeight}
        note={note}
        setNote={setNote}
        error={error}
        isPending={addWeight.isPending}
        isSuccess={addWeight.isSuccess}
        successMessage={addWeight.data?.message}
        onSubmit={handleSubmit}
      />
      <TrendSummary />
      <DeleteAccountDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          setOpenDeleteDialog(false);
          deleteAccount.mutate();
        }}
      />
      <ClearGoalDialog
        open={openClearGoalDialog}
        onClose={() => setOpenClearGoalDialog(false)}
        onConfirm={() => {
          setOpenClearGoalDialog(false);
          clearGoal.mutate();
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Weight added, trends updated!
        </Alert>
      </Snackbar>
    </>
  );
}