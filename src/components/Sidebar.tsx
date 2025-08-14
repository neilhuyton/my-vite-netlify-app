// src/components/Sidebar.tsx
import { useContext } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, IconButton } from "@mui/material";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  locationPathname: string;
  drawerWidth: number;
}

export default function Sidebar({
  mobileOpen,
  onDrawerToggle,
  drawerWidth,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const themeContext = useContext(ThemeContext);

  if (!themeContext) throw new Error("ThemeContext must be used within a ThemeProvider");

  const { toggleTheme } = themeContext;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/" selected={pathname === "/"}>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/list" selected={pathname === "/list"}>
                <ListItemText primary="Weight List" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/graph" selected={pathname === "/graph"}>
                <ListItemText primary="Weight Graph" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={toggleTheme}>
                <IconButton sx={{ mr: 1 }}>
                  <Brightness7Icon />
                </IconButton>
                <ListItemText primary="Toggle Theme" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" selected={pathname === "/login"}>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/signup" selected={pathname === "/signup"}>
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}