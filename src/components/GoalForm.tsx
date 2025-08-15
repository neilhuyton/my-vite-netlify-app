// src/components/GoalForm.tsx
import { Box, TextField, Button, Typography } from "@mui/material";
import GoalIcon from "@mui/icons-material/Flag";

interface GoalFormProps {
  goalWeight: string;
  setGoalWeight: (value: string) => void;
  startWeight: string; // Add startWeight
  setStartWeight: (value: string) => void; // Add setStartWeight
  error: string;
  isPending: boolean;
  isSuccess: boolean;
  successMessage?: string;
  onSubmit: (goalWeight: string, startWeight: string) => void; // Update onSubmit
}

export default function GoalForm({
  goalWeight,
  setGoalWeight,
  startWeight,
  setStartWeight,
  error,
  isPending,
  isSuccess,
  successMessage,
  onSubmit,
}: GoalFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(goalWeight, startWeight);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          type="number"
          inputProps={{ step: "0.1", min: "0.1" }}
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
          label="Goal Weight (kg)"
          variant="outlined"
          required
          fullWidth
          sx={{ mb: 1 }}
        />
        <TextField
          type="number"
          inputProps={{ step: "0.1", min: "0.1" }}
          value={startWeight}
          onChange={(e) => setStartWeight(e.target.value)}
          label="Starting Weight (kg)"
          variant="outlined"
          required
          fullWidth
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<GoalIcon />}
          disabled={isPending}
          fullWidth
          sx={{ py: 1.5, fontSize: "1rem" }}
        >
          {isPending ? "Saving..." : "Set Goal"}
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mt: 1, fontSize: "0.875rem" }}>
          {error}
        </Typography>
      )}
      {isSuccess && successMessage && (
        <Typography color="success.main" sx={{ mt: 1, fontSize: "0.875rem" }}>
          {successMessage}
        </Typography>
      )}
    </Box>
  );
}
