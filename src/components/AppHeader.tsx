// src/components/AppHeader.tsx
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode icon
import { useThemeContext } from "../context/ThemeContext";
import { useTheme } from "@mui/material/styles";

interface AppHeaderProps {
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function AppHeader({
  onDrawerToggle,
  drawerWidth,
}: AppHeaderProps) {
  const { toggleTheme } = useThemeContext();
  const theme = useTheme(); // Access current theme to determine icon

  return (
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
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Weight Tracker
        </Typography>
        <IconButton
          color="inherit"
          aria-label="toggle theme"
          onClick={toggleTheme}
        >
          {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}