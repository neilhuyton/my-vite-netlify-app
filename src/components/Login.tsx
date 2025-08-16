// src/components/Login.tsx
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../store";
import { trpc } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setUser } = useStore();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: { token: string; user: { id: string; email: string } }) => {
      console.log("Login success:", { email: data.user.email, token: data.token });
      login(data.token, { id: data.user.id, email: data.user.email });
      setUser({ email: data.user.email, token: data.token });
      setEmail("");
      setPassword("");
      setError("");
      navigate({ to: "/" });
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      console.error("Login error:", {
        message: err.message,
        data: err.data,
        email,
        password,
      });
      setError("Login failed. Please check your email and password.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    console.log("Submitting login:", { email, password });
    loginMutation.mutate({ email: email.trim(), password: password.trim() });
  };

  return (
    <Box
      sx={{ p: 3, maxWidth: 400, mx: "auto" }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Login
      </Typography>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        type="email"
        required
        error={!!error && !email.trim()}
        helperText={error && !email.trim() ? "Email is required" : ""}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        required
        error={!!error && !password.trim()}
        helperText={error && !password.trim() ? "Password is required" : ""}
      />
      {error && email.trim() && password.trim() && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        type="submit"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </Button>
      <Button
        onClick={() => navigate({ to: "/signup" })}
        sx={{ mt: 1, display: "block" }}
      >
        Sign Up
      </Button>
      <Button
        onClick={() => navigate({ to: "/forgot-password" })}
        sx={{ mt: 1, display: "block" }}
      >
        Forgot Password
      </Button>
    </Box>
  );
}