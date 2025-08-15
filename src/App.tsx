// src/App.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Toolbar,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import WeightForm from "./components/WeightForm";
import GoalForm from "./components/GoalForm";
import TrendSummary from "./components/TrendSummary";
import { useAuth } from "./context/AuthContext";
import { trpc, queryClient } from "./trpc";

export const App = () => {
  const drawerWidth = 200;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Add Snackbar state
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { data: goalData, refetch: refetchGoal } = trpc.getGoal.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  );

  const addWeight = trpc.addWeight.useMutation({
    onSuccess: (response) => {
      console.log("addWeight response:", response);
      setWeight("");
      setNote("");
      setError("");
      console.log("Invalidating getWeights and getWeightTrends queries");
      queryClient.removeQueries({ queryKey: ["getWeights"] });
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
      queryClient.removeQueries({ queryKey: ["getWeightTrends"] });
      queryClient.invalidateQueries({ queryKey: ["getWeightTrends"] });
      refetchGoal();
      setRefreshKey((prev) => prev + 1);
      setSnackbarOpen(true); // Show Snackbar
    },
    onError: (err) => {
      console.log("addWeight error:", err.message);
      setError(err.message);
    },
  });

  const setGoal = trpc.setGoal.useMutation({
    onSuccess: (response) => {
      console.log("setGoal response:", response);
      setGoalWeight("");
      setStartWeight("");
      setError("");
      refetchGoal();
    },
    onError: (err) => {
      console.log("setGoal error:", err.message);
      setError(err.message);
    },
  });

  const clearGoal = trpc.clearGoal.useMutation({
    onSuccess: () => {
      console.log("Goal cleared successfully");
      setError("");
      refetchGoal();
    },
    onError: (err) => {
      console.log("clearGoal error:", err.message);
      setError(err.message);
    },
  });

  const deleteAccount = trpc.deleteAccount.useMutation({
    onSuccess: () => {
      console.log("Account deleted successfully");
      logout();
      navigate({ to: "/login" });
    },
    onError: (err) => {
      console.log("deleteAccount error:", err.message);
      setError("Failed to delete account: " + err.message);
    },
  });

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (
        event.mutation?.state.status === "error" &&
        event.mutation?.state.error instanceof Error &&
        event.mutation?.state.error.message === "UNAUTHORIZED"
      ) {
        if (!user) {
          navigate({ to: "/login" });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  const handleSubmit = (value: string, note?: string) => {
    const weightValue = parseFloat(value);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Invalid weight");
      return;
    }
    console.log("Submitting weight:", weightValue, "note:", note);
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
    console.log(
      "Submitting goal weight:",
      goalWeightValue,
      "start weight:",
      startWeightValue
    );
    setGoal.mutate({
      goalWeightKg: goalWeightValue,
      startWeightKg: startWeightValue,
    });
  };

  const handleDeleteAccountClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    deleteAccount.mutate();
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const progress =
    goalData?.goalWeightKg &&
    goalData?.latestWeightKg &&
    goalData?.startWeightKg &&
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

  return (
    <Box sx={{ display: "flex" }}>
      <AppHeader
        onDrawerToggle={() => setMobileOpen(!mobileOpen)}
        drawerWidth={drawerWidth}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={() => setMobileOpen(!mobileOpen)}
        locationPathname={pathname}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        {user && (
          <>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Welcome, {user.email}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={logout}>Logout</Button>
                <Button color="error" onClick={handleDeleteAccountClick}>
                  Delete Account
                </Button>
              </Box>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Set Weight Goal
              </Typography>
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
              {goalData?.goalWeightKg && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    Goal: {goalData.goalWeightKg.toFixed(1)} kg
                    {goalData.goalSetAt &&
                      ` (Set on ${new Date(
                        goalData.goalSetAt
                      ).toLocaleDateString()})`}
                  </Typography>
                  {goalData.latestWeightKg && goalData.startWeightKg && (
                    <>
                      <Typography variant="body1">
                        Starting Weight: {goalData.startWeightKg.toFixed(1)} kg
                      </Typography>
                      <Typography variant="body1">
                        Latest Weight: {goalData.latestWeightKg.toFixed(1)} kg
                      </Typography>
                      <Typography variant="body1">
                        Progress to Goal:{" "}
                        {Math.abs(
                          goalData.latestWeightKg - goalData.goalWeightKg
                        ).toFixed(1)}{" "}
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
                    onClick={() => clearGoal.mutate()}
                    disabled={clearGoal.isPending || !goalData?.goalWeightKg}
                    sx={{ mt: 1 }}
                  >
                    Clear Goal
                  </Button>
                </Box>
              )}
            </Box>
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
          </>
        )}
        <Outlet key={refreshKey} />

        <Dialog
          open={openDeleteDialog}
          onClose={handleCancelDelete}
          aria-labelledby="delete-account-title"
          aria-describedby="delete-account-description"
        >
          <DialogTitle id="delete-account-title">Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-account-description">
              Are you sure you want to delete your account? This will
              permanently remove your account and all associated weight
              measurements. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    </Box>
  );
};
