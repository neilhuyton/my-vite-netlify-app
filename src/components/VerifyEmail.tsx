// src/components/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { trpc } from "../trpc";
import { useAuth } from "../context/AuthContext";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function VerifyEmail() {
  const { token } = useSearch({ from: "/verify-email" });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data: {
      message: string;
      token: string;
      email: string;
      id: string;
    }) => {
      setSuccess(true);
      login(data.token, { id: data.id, email: data.email });
      setTimeout(() => navigate({ to: "/" }), 2000);
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      setError(err.message || "Failed to verify email");
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token });
    } else {
      setError("No verification token provided");
    }
  }, [token]);

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Email Verification
      </Typography>
      {verifyEmail.isPending && <CircularProgress />}
      {success && (
        <Alert severity="success">
          Email verified successfully! Redirecting to home...
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
