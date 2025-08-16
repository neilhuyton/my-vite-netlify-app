// src/components/AppContent.tsx
import { useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

export function AppContent() {
  console.log("AppContent.tsx: Rendering AppContent component");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const publicRoutes = useMemo(
    () => ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"],
    []
  );

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!user?.token && !publicRoutes.includes(pathname)) {
      console.log("AppContent.tsx: Redirecting to /login");
      navigate({ to: "/login" });
    }
  }, [user?.token, pathname, navigate, publicRoutes]);

  return (
    <Box sx={{ display: "flex" }}>
      {user?.token && (
        <Sidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          locationPathname={pathname}
          drawerWidth={240}
        />
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}