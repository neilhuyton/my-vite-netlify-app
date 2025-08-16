// src/components/ClearGoalDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ClearGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClearGoalDialog({
  open,
  onClose,
  onConfirm,
}: ClearGoalDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="clear-goal-title"
      aria-describedby="clear-goal-description"
    >
      <DialogTitle id="clear-goal-title">Clear Goal</DialogTitle>
      <DialogContent>
        <DialogContentText id="clear-goal-description">
          Are you sure you want to clear your weight goal? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="secondary" autoFocus>
          Clear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
