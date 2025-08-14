// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { trpc, trpcClient, queryClient } from "./trpc";
import { router } from "./router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f4f6f8", paper: "#fff" },
    text: { primary: "#173A5E", secondary: "#46505A" },
    action: { active: "#001E3C" },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h6: {
      fontWeight: 500,
      fontSize: "1.25rem",
      "@media (max-width: 600px)": { fontSize: "1.1rem" },
    },
    body1: {
      fontSize: "1rem",
      "@media (max-width: 600px)": { fontSize: "0.9rem" },
    },
    body2: {
      fontSize: "0.875rem",
      "@media (max-width: 600px)": { fontSize: "0.8rem" },
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#182837",
          color: "#fff",
          width: 200,
          "@media (max-width: 600px)": { width: "85%" },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: "#fff", color: "#173A5E" } },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none" } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": { backgroundColor: "rgba(25, 118, 210, 0.12)" },
          py: 1.5,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  </React.StrictMode>
);