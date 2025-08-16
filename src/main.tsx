// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, queryClient, createTRPCClient } from "./trpc";
import { router } from "./router";

console.log("main.tsx: Initializing");

const TRPCWrapper = () => {
  const { user, logout } = useAuth();
  const trpcClient = createTRPCClient(user?.token || null, logout);

  console.log("main.tsx: Rendering TRPCWrapper");
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const AppWrapper = () => {
  console.log("main.tsx: Rendering AppWrapper");
  return (
    <ThemeProvider theme={createTheme()}>
      <AuthProvider>
        <TRPCWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
};

console.log("main.tsx: Creating root");
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

console.log("main.tsx: Render initiated");
root.render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);