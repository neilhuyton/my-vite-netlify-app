// src/components/AppHeader.tsx
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
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
        <Typography variant="h6" noWrap>
          Weight Tracker
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
