// src/components/Profile.tsx
import { useState } from "react";
import { Box, Typography, TextField, Button, Alert, Snackbar } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { useAccountMutations } from "../hooks/useAccountMutations";

export default function Profile() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { updatePassword, updateEmail, deleteAccount, error: mutationError } = useAccountMutations();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    updatePassword.mutate(
      { newPassword },
      {
        onSuccess: () => {
          setSnackbarMessage("Password updated successfully");
          setSnackbarOpen(true);
          setNewPassword("");
          setConfirmPassword("");
          setPasswordError("");
        },
        onError: (err) => setPasswordError(err.message || "Failed to update password"),
      }
    );
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes("@")) {
      setEmailError("Invalid email address");
      return;
    }
    updateEmail.mutate(
      { newEmail },
      {
        onSuccess: () => {
          setSnackbarMessage("Email updated successfully");
          setSnackbarOpen(true);
          setNewEmail("");
          setEmailError("");
          logout(); // Log out to force re-authentication with new email
          navigate({ to: "/login" });
        },
        onError: (err) => setEmailError(err.message || "Failed to update email"),
      }
    );
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (!user?.token) return null;

  return (
    <Box sx={{ mt: 2, maxWidth: 500 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Profile
      </Typography>
      {(mutationError || passwordError || emailError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mutationError || passwordError || emailError}
        </Alert>
      )}
      <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Update Password
        </Typography>
        <TextField
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          label="New Password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <TextField
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm Password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <Button
          type="submit"
          variant="contained"
          disabled={updatePassword.isPending}
          fullWidth
        >
          {updatePassword.isPending ? "Updating..." : "Update Password"}
        </Button>
      </Box>
      <Box component="form" onSubmit={handleEmailSubmit} sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Change Email
        </Typography>
        <TextField
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          label="New Email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <Button
          type="submit"
          variant="contained"
          disabled={updateEmail.isPending}
          fullWidth
        >
          {updateEmail.isPending ? "Updating..." : "Update Email"}
        </Button>
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Delete Account
        </Typography>
        <Button
          color="error"
          variant="outlined"
          onClick={() => setOpenDeleteDialog(true)}
          fullWidth
        >
          Delete Account
        </Button>
      </Box>
      <DeleteAccountDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          setOpenDeleteDialog(false);
          deleteAccount.mutate();
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}