// src/components/Sidebar.tsx
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar } from "@mui/material";
import { Link } from "@tanstack/react-router";

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  locationPathname: string;
  drawerWidth: number;
}

export default function Sidebar({ mobileOpen, onDrawerToggle, locationPathname, drawerWidth }: SidebarProps) {
  const drawerContent = (
    <div>
      <Toolbar />
      <List>
        {[
          { text: "Home", path: "/" },
          { text: "List", path: "/list" },
          { text: "Graph", path: "/graph" },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={locationPathname === item.path}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
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
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}