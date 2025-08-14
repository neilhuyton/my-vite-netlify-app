// src/router.tsx
import { createRouter, createRootRoute, createRoute } from "@tanstack/react-router";
import { App } from "./App";
import WeightList from "./components/WeightList";
import WeightChart from "./components/WeightChart";

// Define the root route
const rootRoute = createRootRoute({
  component: App,
});

// Define the index route (default route at '/')
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/", // Index route for the root path
  component: WeightList,
});

// Define other child routes
const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "graph",
  component: WeightChart,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, graphRoute]);

// Create the router
export const router = createRouter({ routeTree });

export default router;
