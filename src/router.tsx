// src/router.tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
  NotFoundRoute,
} from "@tanstack/react-router";
import WeightList from "./components/WeightList";
import WeightChart from "./components/WeightChart";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import GoalContent from "./components/GoalContent";
import { AuthenticatedRoute } from "./components/AuthenticatedRoute";
import { AppContent } from "./components/AppContent";
import MainContent from "./components/MainContent";

const rootRoute = createRootRoute({
  component: () => {
    console.log("router.tsx: Rendering root route");
    return <AppContent />;
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    console.log("router.tsx: Rendering index route");
    return (
      <AuthenticatedRoute>
        <MainContent />
      </AuthenticatedRoute>
    );
  },
});

const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/list",
  component: () => {
    console.log("router.tsx: Rendering list route");
    return (
      <AuthenticatedRoute>
        <WeightList />
      </AuthenticatedRoute>
    );
  },
});

const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/graph",
  component: () => {
    console.log("router.tsx: Rendering graph route");
    return (
      <AuthenticatedRoute>
        <WeightChart />
      </AuthenticatedRoute>
    );
  },
});

const goalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goal",
  component: () => {
    console.log("router.tsx: Rendering goal route");
    return (
      <AuthenticatedRoute>
        <GoalContent />
      </AuthenticatedRoute>
    );
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => {
    console.log("router.tsx: Rendering login route");
    return <Login />;
  },
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => {
    console.log("router.tsx: Rendering signup route");
    return <Signup />;
  },
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: () => {
    console.log("router.tsx: Rendering verify-email route");
    return <VerifyEmail />;
  },
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: () => {
    console.log("router.tsx: Rendering forgot-password route");
    return <ForgotPassword />;
  },
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: () => {
    console.log("router.tsx: Rendering reset-password route");
    return <ResetPassword />;
  },
});

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => {
    console.log("router.tsx: Rendering not-found route");
    return <div>404: Page Not Found</div>;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listRoute,
  graphRoute,
  goalRoute,
  loginRoute,
  signupRoute,
  verifyEmailRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  notFoundRoute,
]);

export const router = createRouter({ routeTree });

export default router;