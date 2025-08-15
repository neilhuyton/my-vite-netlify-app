//src/router.tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import WeightList from "./components/WeightList";
import WeightChart from "./components/WeightChart";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyEmail from "./components/VerifyEmail";
import { AuthenticatedRoute } from "./components/AuthenticatedRoute";
import { App } from "./App";

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AuthenticatedRoute>
      <WeightList />
      <WeightChart />
    </AuthenticatedRoute>
  ),
});

const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/list",
  component: () => (
    <AuthenticatedRoute>
      <WeightList />
    </AuthenticatedRoute>
  ),
});

const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/graph",
  component: () => (
    <AuthenticatedRoute>
      <WeightChart />
    </AuthenticatedRoute>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Signup,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: VerifyEmail,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listRoute,
  graphRoute,
  loginRoute,
  signupRoute,
  verifyEmailRoute,
]);

export const router = createRouter({ routeTree });

export default router;
