// src/components/Sidebar.tsx
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import ListIcon from "@mui/icons-material/List";
import ShowChartIcon from "@mui/icons-material/ShowChart";

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  locationPathname: string;
  drawerWidth: number;
}

export default function Sidebar({ mobileOpen, onDrawerToggle, locationPathname, drawerWidth }: SidebarProps) {
  const drawer = (
    <Box sx={{ textAlign: "center", pt: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Weight Tracker
      </Typography>
      <List>
        {[
          { text: "List View", to: "/list", icon: <ListIcon /> },
          { text: "Graph View", to: "/graph", icon: <ShowChartIcon /> },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.to}
              onClick={() => mobileOpen && onDrawerToggle()}
              selected={locationPathname === item.to}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="navigation">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: "85%" },
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
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}