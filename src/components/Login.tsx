// src/components/Login.tsx
import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { trpc } from "../trpc";
import { useNavigate } from "@tanstack/react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const loginMutation = trpc.login.useMutation({
    onSuccess: ({ token, user }) => {
      login(token, user);
      navigate({ to: "/" });
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = () => {
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Login
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
        disabled={loginMutation.isPending}
        fullWidth
      >
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </Button>
      <Button sx={{ mt: 1 }} onClick={() => navigate({ to: "/signup" })}>
        Need an account? Sign up
      </Button>
    </Box>
  );
}
