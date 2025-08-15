// src/App.tsx
import { useState, useEffect } from "react";
import { Box, Toolbar, Button, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import WeightForm from "./components/WeightForm";
import { useAuth } from "./context/AuthContext";
import { trpc, queryClient } from "./trpc";

export const App = () => {
  const drawerWidth = 200;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState(""); // State for note
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Add to force Outlet re-render
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const addWeight = trpc.addWeight.useMutation({
    onSuccess: (response) => {
      console.log("addWeight response:", response);
      setWeight("");
      setNote(""); // Reset note on success
      setError("");
      console.log("Invalidating getWeights query");
      // Clear cache and invalidate to ensure fresh data
      queryClient.removeQueries({ queryKey: ["getWeights"] });
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
      // Force Outlet re-render
      setRefreshKey(prev => prev + 1);
    },
    onError: (err) => {
      console.log("addWeight error:", err.message);
      setError(err.message);
    },
  });

  // Handle unauthorized errors
  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (
        event.mutation?.state.status === "error" &&
        event.mutation?.state.error instanceof Error &&
        event.mutation?.state.error.message === "UNAUTHORIZED"
      ) {
        if (!user) {
          navigate({ to: "/login" });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  const handleSubmit = (value: string, note?: string) => {
    const weightValue = parseFloat(value);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Invalid weight");
      return;
    }
    console.log("Submitting weight:", weightValue, "note:", note);
    addWeight.mutate({ weightKg: weightValue, note });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppHeader onDrawerToggle={() => setMobileOpen(!mobileOpen)} drawerWidth={drawerWidth} />
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={() => setMobileOpen(!mobileOpen)}
        locationPathname={pathname}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        {user && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Welcome, {user.email}</Typography>
              <Button onClick={logout}>Logout</Button>
            </Box>
            <WeightForm
              weight={weight}
              setWeight={setWeight}
              note={note} // Pass note state
              setNote={setNote} // Pass setNote function
              error={error}
              isPending={addWeight.isPending}
              isSuccess={addWeight.isSuccess}
              successMessage={addWeight.data?.message}
              onSubmit={handleSubmit}
            />
          </>
        )}
        <Outlet key={refreshKey} />
      </Box>
    </Box>
  );
};