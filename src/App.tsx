// src/App.tsx
import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet, useLocation } from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import WeightForm from "./components/WeightForm";
import { trpc } from "./trpc";

export const App = () => {
  const drawerWidth = 200;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const { pathname } = useLocation();

  const addWeight = trpc.addWeight.useMutation({
    onSuccess: () => {
      setWeight("");
      setError("");
    },
    onError: (error) => setError(error.message),
  });

  const handleSubmit = (value: string) => {
    const weightValue = parseFloat(value);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Invalid weight");
      return;
    }
    addWeight.mutate({ weightKg: weightValue });
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
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <WeightForm
          weight={weight}
          setWeight={setWeight}
          error={error}
          isPending={addWeight.isPending}
          isSuccess={addWeight.isSuccess}
          successMessage={addWeight.data?.message}
          onSubmit={handleSubmit}
        />
        <Outlet />
      </Box>
    </Box>
  );
};