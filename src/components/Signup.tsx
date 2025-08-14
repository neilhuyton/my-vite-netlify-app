// src/components/Signup.tsx
import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { trpc } from "../trpc";
import { useNavigate } from "@tanstack/react-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const signupMutation = trpc.signup.useMutation({
    onSuccess: ({ token, user }) => {
      login(token, user);
      navigate({ to: "/" });
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = () => {
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
