// src/components/MainContent.tsx
import { useState } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import WeightForm from "./WeightForm";
import { useWeightMutations } from "../hooks/useWeightMutations";

export default function MainContent() {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addWeight, error, setError } = useWeightMutations();

  const handleSubmit = (value: string, note?: string) => {
    const weightValue = parseFloat(value);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Invalid weight");
      return;
    }
    addWeight.mutate({ weightKg: weightValue, note });
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (!user?.token) return null;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Welcome, {user.email}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
      <Snackbar
        open={snackbarOpen || addWeight.isSuccess}
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