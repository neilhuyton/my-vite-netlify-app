// src/App.tsx
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation } from "@tanstack/react-router";
import { Box, CssBaseline, Container } from "@mui/material";
import { trpc } from "./trpc";
import { GetWeightsResponse, AddWeightResponse } from "./types";
import AppHeader from "./components/AppHeader";
import Sidebar from "./components/Sidebar";
import WeightForm from "./components/WeightForm";

const drawerWidth = 240;

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const location = useLocation();
  const { data, isLoading, isError, error: queryError } = trpc.getWeights.useQuery(undefined, {
    select: (data) => data as GetWeightsResponse,
  });
  const mutation = trpc.addWeight.useMutation({
    onSuccess: (data: AddWeightResponse) => {
      setWeight("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
    },
    onError: (err) => setError(`Failed to add weight: ${err.message}`),
  });

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log(`App: Weights fetched for ${location.pathname}:`, data);
    }
    if (isError && queryError) {
      console.log(`App: Weights fetch error for ${location.pathname}:`, queryError);
    }
  }, [data, isError, queryError, location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubmit = (weight: string) => {
    const weightNum = parseFloat(weight);
    if (weightNum >= 0.1) {
      mutation.mutate({ weightKg: weightNum });
    } else {
      setError("Weight must be at least 0.1 kg");
    }
  };

  if (isLoading) return <Box>Loading...</Box>;
  if (isError) return <Box>Error: {queryError.message}</Box>;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppHeader onDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        locationPathname={location.pathname}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 8 },
        }}
      >
        <Container maxWidth="md">
          <WeightForm
            weight={weight}
            setWeight={setWeight}
            error={error || (mutation.isError ? mutation.error!.message : "")}
            isPending={mutation.isPending}
            isSuccess={mutation.isSuccess}
            successMessage={mutation.data?.message}
            onSubmit={handleSubmit}
          />
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default App;