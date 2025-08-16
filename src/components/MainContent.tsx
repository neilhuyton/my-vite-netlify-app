// src/components/MainContent.tsx
import { useState } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import WeightForm from "./WeightForm";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { useWeightMutations } from "../hooks/useWeightMutations";
import { useAccountMutations } from "../hooks/useAccountMutations";

export default function MainContent() {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addWeight, error, setError } = useWeightMutations();
  const { deleteAccount, error: deleteError } = useAccountMutations();

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
          <Button color="error" onClick={() => setOpenDeleteDialog(true)}>
            Delete Account
          </Button>
        </Box>
      </Box>
      {(error || deleteError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || deleteError}
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
      <DeleteAccountDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          setOpenDeleteDialog(false);
          deleteAccount.mutate();
        }}
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