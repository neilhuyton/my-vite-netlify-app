// src/components/Sidebar.tsx
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ScaleIcon from "@mui/icons-material/Scale";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person"; // Add PersonIcon for profile

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  locationPathname: string;
  drawerWidth: number;
}

export default function Sidebar({ mobileOpen, onDrawerToggle, locationPathname, drawerWidth }: SidebarProps) {
  const theme = useTheme();

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {[
          { text: "Weight", path: "/", icon: <ScaleIcon /> },
          { text: "List", path: "/list", icon: <ScaleIcon /> },
          { text: "Graph", path: "/graph", icon: <ShowChartIcon /> },
          { text: "Goal", path: "/goal", icon: <FlagIcon /> },
          { text: "Profile", path: "/profile", icon: <PersonIcon /> }, // Add Profile link
        ].map((item) => (
          <ListItemButton
            key={item.text}
            selected={locationPathname === item.path}
            href={item.path}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </>
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
        {drawerContent}
      </Drawer>
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