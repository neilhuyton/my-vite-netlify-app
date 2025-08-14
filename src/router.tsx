// src/router.tsx
import { createRouter, createRootRoute, createRoute } from "@tanstack/react-router";
import { App } from "./App";
import WeightList from "./components/WeightList";
import WeightChart from "./components/WeightChart";

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: WeightList,
});

const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "list",
  component: WeightList,
});

const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "graph",
  component: WeightChart,
});

const routeTree = rootRoute.addChildren([indexRoute, listRoute, graphRoute]);

export const router = createRouter({ routeTree });

export default router;