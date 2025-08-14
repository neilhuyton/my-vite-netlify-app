// src/components/AppHeader.tsx
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "../ThemeContext";

interface AppHeaderProps {
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function AppHeader({ onDrawerToggle, drawerWidth }: AppHeaderProps) {
  const theme = useTheme();
  const { toggleTheme } = useThemeContext();

  console.log("AppHeader: Theme context:", { toggleTheme });

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
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
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Weight Tracker
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
          {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}