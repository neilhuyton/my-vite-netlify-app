// src/components/Signup.tsx
import { useState } from "react";
import { Box, TextField, Button, Typography, Alert, Snackbar } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: () => {
      setSnackbarOpen(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => setError(err.message || "Failed to sign up"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    signupMutation.mutate({ email, password });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    navigate({ to: "/login" });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Sign Up
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          variant="outlined"
          required
          fullWidth
        />
        <TextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          variant="outlined"
          required
          fullWidth
        />
        <TextField
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm Password"
          variant="outlined"
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          disabled={signupMutation.isPending}
          fullWidth
        >
          {signupMutation.isPending ? "Signing up..." : "Sign Up"}
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          Verification email sent! Please check your inbox.
        </Alert>
      </Snackbar>
    </Box>
  );
}