// src/components/WeightForm.tsx
import { Box, TextField, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface WeightFormProps {
  weight: string;
  setWeight: (value: string) => void;
  error: string;
  isPending: boolean;
  isSuccess: boolean;
  successMessage?: string;
  onSubmit: (weight: string) => void;
}

export default function WeightForm({ weight, setWeight, error, isPending, isSuccess, successMessage, onSubmit }: WeightFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(weight);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          type="number"
          inputProps={{ step: "0.1", min: "0.1" }}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          label="Weight (kg)"
          variant="outlined"
          required
          fullWidth
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={isPending}
          fullWidth
          sx={{ py: 1.5, fontSize: "1rem" }}
        >
          {isPending ? "Saving..." : "Add"}
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