// src/components/WeightList.tsx
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { trpc } from "../trpc";
import { GetWeightsResponse } from "../types";

export default function WeightList() {
  const { data, isLoading, isError, error } = trpc.getWeights.useQuery(undefined, {
    select: (data) => data as GetWeightsResponse,
  });

  if (isLoading) return <Box>Loading...</Box>;
  if (isError) return <Box>Error: {error.message}</Box>;
  if (!data) return <Box>No data available</Box>;

  const measurements = data.measurements.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Measurements
      </Typography>
      <List>
        {measurements.map((m) => (
          <ListItem key={m.id} disablePadding>
            <ListItemText primary={`${m.weightKg} kg - ${new Date(m.createdAt).toLocaleString()}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}