import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data: { message: string }) => {
      setSuccess(data.message);
      setError("");
      setTimeout(() => navigate({ to: "/verify-email" }), 2000);
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      setError(err.message);
      setSuccess("");
    },
  });

  const handleSubmit = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    signupMutation.mutate({ email, password });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Sign Up
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
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={signupMutation.isPending}
        fullWidth
      >
        {signupMutation.isPending ? "Signing up..." : "Sign Up"}
      </Button>
      <Button sx={{ mt: 1 }} onClick={() => navigate({ to: "/login" })}>
        Already have an account? Login
      </Button>
    </Box>
  );
}
