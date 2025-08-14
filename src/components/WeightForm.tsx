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

export default function WeightForm({
  weight,
  setWeight,
  error,
  isPending,
  isSuccess,
  successMessage,
  onSubmit,
}: WeightFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(weight);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 2, mb: 4 }}
      >
        <TextField
          type="number"
          inputProps={{ step: "0.1", min: "0.1" }}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          label="Weight (kg)"
          variant="outlined"
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Add"}
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {isSuccess && successMessage && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}
    </>
  );
}
