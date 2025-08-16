import { useState, useMemo, Component, ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "../context/AuthContext";
import { trpc, createTRPCClient, queryClient } from "../trpc";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    console.error("ErrorBoundary: Caught error:", error.message);
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

export const AppContent = () => {
  const drawerWidth = 200;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  console.log("AppContent.tsx: Current user:", user);
  console.log("AppContent.tsx: Current pathname:", pathname);

  const trpcClient = useMemo(
    () => {
      console.log("AppContent.tsx: Creating trpcClient with token:", user?.token);
      return createTRPCClient(user?.token || null, () => {
        console.log("AppContent.tsx: Unauthorized, clearing user and redirecting to /login");
        logout();
        navigate({ to: "/login" });
      });
    },
    [user, logout, navigate]
  );

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <Box sx={{ display: "flex" }}>
          <AppHeader
            onDrawerToggle={() => setMobileOpen(!mobileOpen)}
            drawerWidth={drawerWidth}
          />
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
            <Outlet /> {/* Only render child routes */}
          </Box>
        </Box>
      </trpc.Provider>
    </ErrorBoundary>
  );
};