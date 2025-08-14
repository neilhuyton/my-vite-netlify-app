// src/components/AppHeader.tsx
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface AppHeaderProps {
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function AppHeader({
  onDrawerToggle,
  drawerWidth,
}: AppHeaderProps) {
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
        <Typography variant="h6" noWrap component="div">
          Weight Tracker
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
