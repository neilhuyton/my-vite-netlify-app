// src/App.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Toolbar,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import WeightForm from "./components/WeightForm";
import { useAuth } from "./context/AuthContext";
import { trpc, queryClient } from "./trpc";

export const App = () => {
  const drawerWidth = 200;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete confirmation dialog
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const addWeight = trpc.addWeight.useMutation({
    onSuccess: (response) => {
      console.log("addWeight response:", response);
      setWeight("");
      setNote("");
      setError("");
      console.log("Invalidating getWeights query");
      queryClient.removeQueries({ queryKey: ["getWeights"] });
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
      setRefreshKey(prev => prev + 1);
    },
    onError: (err) => {
      console.log("addWeight error:", err.message);
      setError(err.message);
    },
  });

  const deleteAccount = trpc.deleteAccount.useMutation({
    onSuccess: () => {
      console.log("Account deleted successfully");
      logout(); // Log out the user
      navigate({ to: "/login" }); // Redirect to login page
    },
    onError: (err) => {
      console.log("deleteAccount error:", err.message);
      setError("Failed to delete account: " + err.message);
    },
  });

  // Handle unauthorized errors
  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (
        event.mutation?.state.status === "error" &&
        event.mutation?.state.error instanceof Error &&
        event.mutation?.state.error.message === "UNAUTHORIZED"
      ) {
        if (!user) {
          navigate({ to: "/login" });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, user]);

  const handleSubmit = (value: string, note?: string) => {
    const weightValue = parseFloat(value);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Invalid weight");
      return;
    }
    console.log("Submitting weight:", weightValue, "note:", note);
    addWeight.mutate({ weightKg: weightValue, note });
  };

  const handleDeleteAccountClick = () => {
    setOpenDeleteDialog(true); // Open confirmation dialog
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    deleteAccount.mutate(); // Trigger account deletion
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false); // Close dialog without deleting
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppHeader onDrawerToggle={() => setMobileOpen(!mobileOpen)} drawerWidth={drawerWidth} />
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
        {user && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">Welcome, {user.email}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={logout}>Logout</Button>
                <Button color="error" onClick={handleDeleteAccountClick}>
                  Delete Account
                </Button>
              </Box>
            </Box>
            <WeightForm
              weight={weight}
              setWeight={setWeight}
              note={note}
              setNote={setNote}
              error={error}
              isPending={addWeight.isPending}
              isSuccess={addWeight.isSuccess}
              successMessage={addWeight.data?.message}
              onSubmit={handleSubmit}
            />
          </>
        )}
        <Outlet key={refreshKey} />

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCancelDelete}
          aria-labelledby="delete-account-title"
          aria-describedby="delete-account-description"
        >
          <DialogTitle id="delete-account-title">Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-account-description">
              Are you sure you want to delete your account? This will permanently remove your account and all associated
              weight measurements. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};