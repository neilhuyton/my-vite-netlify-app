// src/App.tsx
import { useState, useMemo } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import MainContent from "./components/MainContent";
import { useStore } from "./store";
import { trpc, createTRPCClient, queryClient } from "./trpc";

export const App = () => {
  const drawerWidth = 200;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearUser } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const trpcClient = useMemo(
    () =>
      createTRPCClient(user?.token || null, () => {
        clearUser();
        navigate({ to: "/login" });
      }),
    [user, clearUser, navigate]
  );

  return (
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
          <MainContent />
          <Outlet />
        </Box>
      </Box>
    </trpc.Provider>
  );
};