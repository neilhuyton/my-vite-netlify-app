import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data: { message: string }) => {
      setSuccess(data.message);
      setError("");
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      setError(err.message);
      setSuccess("");
    },
  });

  const handleSubmit = () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setError("");
    requestReset.mutate({ email });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Forgot Password
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
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={requestReset.isPending}
        fullWidth
      >
        {requestReset.isPending ? "Sending..." : "Send Reset Link"}
      </Button>
      <Button sx={{ mt: 1 }} onClick={() => navigate({ to: "/login" })}>
        Back to Login
      </Button>
    </Box>
  );
}
