// src/main.tsx
import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { trpc, trpcClient, queryClient } from "./trpc";
import { router } from "./router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeContext } from "./ThemeContext"; // Import the new context
import "./index.css";

const getInitialTheme = (): "light" | "dark" => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme === "dark" ? "dark" : "light";
};

export const AppWrapper = () => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">(
    getInitialTheme()
  );

  const toggleTheme = () => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          ...(themeMode === "light"
            ? {
                primary: { main: "#1976d2" },
                secondary: { main: "#9c27b0" },
                background: { default: "#f4f6f8", paper: "#fff" },
                text: { primary: "#173A5E", secondary: "#46505A" },
                action: { active: "#001E3C" },
              }
            : {
                primary: { main: "#90caf9" },
                secondary: { main: "#f48fb1" },
                background: { default: "#121212", paper: "#1e1e1e" },
                text: { primary: "#e0e0e0", secondary: "#b0b0b0" },
                action: { active: "#40c4ff" },
              }),
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
                backgroundColor: themeMode === "light" ? "#182837" : "#1e1e1e",
                color: themeMode === "light" ? "#fff" : "#e0e0e0",
                width: 200,
                "@media (max-width: 600px)": { width: "85%" },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: themeMode === "light" ? "#fff" : "#1e1e1e",
                color: themeMode === "light" ? "#173A5E" : "#e0e0e0",
              },
            },
          },
          MuiButton: {
            styleOverrides: { root: { textTransform: "none" } },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  backgroundColor:
                    themeMode === "light"
                      ? "rgba(25, 118, 210, 0.12)"
                      : "rgba(144, 202, 249, 0.16)",
                },
                py: 1.5,
              },
            },
          },
        },
      }),
    [themeMode]
  );

  // Debugging: Log the context being provided
  console.log("main.tsx: Theme context:", { toggleTheme });

  return (
    <React.StrictMode>
      <ThemeContext.Provider value={{ toggleTheme }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} /> {/* Removed context prop */}
            </QueryClientProvider>
          </trpc.Provider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<AppWrapper />);
