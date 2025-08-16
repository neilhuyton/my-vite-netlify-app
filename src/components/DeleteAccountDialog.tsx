// src/components/DeleteAccountDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
    >
      <DialogTitle id="delete-account-title">Delete Account</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-account-description">
          Are you sure you want to delete your account? This will permanently
          remove your account and all associated weight measurements. This
          action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
