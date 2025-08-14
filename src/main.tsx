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

// Create a theme matching the MUI Dashboard Template
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue from dashboard template
    },
    secondary: {
      main: "#9c27b0", // Purple from dashboard template
    },
    background: {
      default: "#f4f6f8", // Light gray background for main content
      paper: "#fff", // White background for cards, drawer, etc.
    },
    text: {
      primary: "#173A5E", // Dark text for contrast
      secondary: "#46505A", // Lighter text for secondary elements
    },
    action: {
      active: "#001E3C", // Used for active states
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#182837", // Dark sidebar background
          color: "#fff", // White text in sidebar
          width: 240,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff", // White AppBar to match template
          color: "#173A5E", // Dark text for AppBar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Matches dashboard's button style
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "rgba(25, 118, 210, 0.12)", // Highlight selected sidebar item
          },
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