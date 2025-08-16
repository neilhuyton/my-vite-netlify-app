import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import { trpc, queryClient } from "../trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

type WeightMeasurement = { id: string; weightKg: number; createdAt: string; note?: string | null };
type GetWeightsResponse = { measurements: WeightMeasurement[] };

export default function WeightList() {
  const [weightToDelete, setWeightToDelete] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("all");

  const { data, isLoading, isError, error } = trpc.weight.getWeights.useQuery(
    { timeRange },
    { refetchOnWindowFocus: false }
  );

  const deleteWeight = trpc.weight.deleteWeight.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["weight", "getWeights", { timeRange }],
      });
      queryClient.invalidateQueries({
        queryKey: ["trend", "getWeightTrends", { timeRange }],
      });
      setWeightToDelete(null);
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete weight error:", err.message);
    },
  });

  const handleDeleteClick = (id: string) => {
    setWeightToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (weightToDelete) {
      deleteWeight.mutate({ id: weightToDelete });
    }
  };

  const handleCancelDelete = () => {
    setWeightToDelete(null);
  };

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading...</Box>;
  if (isError)
    return <Box sx={{ p: 2, textAlign: "center" }}>Error: {error.message}</Box>;
  if (!data?.measurements.length)
    return <Box sx={{ p: 2, textAlign: "center" }}>No weights recorded</Box>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Weight History
      </Typography>
      <Select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value as "30d" | "90d" | "all")}
        sx={{ mb: 1 }}
        aria-label="Select time range"
      >
        <MenuItem value="30d">Last 30 Days</MenuItem>
        <MenuItem value="90d">Last 90 Days</MenuItem>
        <MenuItem value="all">All Time</MenuItem>
      </Select>
      <Table aria-label="Weight history table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Weight (kg)</TableCell>
            <TableCell>Note</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.measurements.map((entry: WeightMeasurement) => (
            <TableRow key={entry.id}>
              <TableCell>
                {new Date(entry.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{entry.weightKg.toFixed(1)}</TableCell>
              <TableCell>{entry.note || "-"}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  onClick={() => handleDeleteClick(entry.id)}
                  aria-label={`Delete weight entry from ${new Date(
                    entry.createdAt
                  ).toLocaleDateString()}`}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!weightToDelete}
        onClose={handleCancelDelete}
        aria-labelledby="delete-weight-title"
        aria-describedby="delete-weight-description"
      >
        <DialogTitle id="delete-weight-title">Delete Weight</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-weight-description">
            Are you sure you want to delete this weight entry? This action
            cannot be undone.
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
  );
}