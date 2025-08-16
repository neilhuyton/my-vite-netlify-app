import { useEffect, useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { trpc } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function ResetPassword() {
  const { token } = useSearch({ from: "/reset-password" });
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: (data: { message: string }) => {
      setSuccess(data.message);
      setError(null);
      setTimeout(() => navigate({ to: "/login" }), 2000);
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      setError(err.message);
      setSuccess(null);
    },
  });

  const handleSubmit = () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (!token) {
      setError("No reset token provided");
      return;
    }
    resetPassword.mutate({ token, newPassword });
  };

  useEffect(() => {
    if (!token) {
      setError("No reset token provided");
    }
  }, [token]);

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reset Password
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={resetPassword.isPending}
        fullWidth
      >
        {resetPassword.isPending ? "Resetting..." : "Reset Password"}
      </Button>
      <Button sx={{ mt: 1 }} onClick={() => navigate({ to: "/login" })}>
        Back to Login
      </Button>
    </Box>
  );
}
