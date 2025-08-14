// src/App.tsx
import { useState } from "react";
import { trpc } from "./trpc";
import { useQueryClient } from "@tanstack/react-query";
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
import { Link, Outlet, useLocation } from "@tanstack/react-router"; // Added useLocation
import "chartjs-adapter-date-fns";
import "./App.css";
import { GetWeightsResponse, WeightMeasurement } from "./types";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Container,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ListIcon from "@mui/icons-material/List";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AddIcon from "@mui/icons-material/Add";

// Register Chart.js components
ChartJS.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

const drawerWidth = 240;

export function WeightList() {
  const { data } = trpc.getWeights.useQuery(undefined, { select: (data) => data as GetWeightsResponse });
  const measurements = data!.measurements.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Measurements
      </Typography>
      <List>
        {measurements.map((m) => (
          <ListItem key={m.id} disablePadding>
            <ListItemText primary={`${m.weightKg} kg - ${new Date(m.createdAt).toLocaleString()}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export function WeightChart() {
  const { data } = trpc.getWeights.useQuery(undefined, { select: (data) => data as GetWeightsResponse });
  const measurements = data!.measurements.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = {
    datasets: [
      {
        label: "Weight (kg)",
        data: measurements.map((m) => ({ x: new Date(m.createdAt), y: m.weightKg })),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const, tooltipFormat: "MMM d, yyyy" },
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "Weight (kg)" },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: (ctx: any) => `Weight: ${ctx.parsed.y} kg` } },
    },
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Weight Trend
      </Typography>
      <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
        <Chart type="line" data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
}

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error: queryError } = trpc.getWeights.useQuery(undefined, {
    select: (data) => data as GetWeightsResponse,
  });
  const mutation = trpc.addWeight.useMutation({
    onSuccess: () => {
      setWeight("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
    },
    onError: (err) => setError(`Failed to add weight: ${err.message}`),
  });
  const location = useLocation(); // Added to track current route

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (weightNum >= 0.1) {
      mutation.mutate({ weightKg: weightNum });
    } else {
      setError("Weight must be at least 0.1 kg");
    }
  };

  // Sidebar navigation with active state
  const drawer = (
    <Box sx={{ textAlign: "center", pt: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Weight Tracker
      </Typography>
      <List>
        {[
          { text: "List View", to: "/list", icon: <ListIcon /> },
          { text: "Graph View", to: "/graph", icon: <ShowChartIcon /> },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              selected={location.pathname === item.to} // Highlight active route
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isLoading) return <Box>Loading...</Box>;
  if (isError) return <Box>Error: {queryError.message}</Box>;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Weight Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content */}
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
          <Typography variant="body1" gutterBottom>
            {data!.message}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, mb: 4 }}>
            <TextField
              type="number"
              inputProps={{ step: "0.1", min: "0.1" }}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              label="Weight (kg)"
              variant="outlined"
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Add"}
            </Button>
          </Box>
          {(error || mutation.isError) && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error || mutation.error!.message}
            </Typography>
          )}
          {mutation.isSuccess && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {mutation.data.message}
            </Typography>
          )}
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default App;