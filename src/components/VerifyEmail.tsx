import { useEffect, useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { trpc } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function VerifyEmail() {
  const { token } = useSearch({ from: "/verify-email" });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data: { message: string }) => {
      setTimeout(() => navigate({ to: "/login" }), 2000);
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      setError(err.message);
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
      {verifyEmail.isSuccess && (
        <Alert severity="success">
          Email verified successfully! Redirecting to login...
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
