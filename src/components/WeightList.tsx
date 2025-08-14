// src/components/WeightList.tsx
import { List, ListItem, ListItemText, Typography, Box } from "@mui/material";
import { useEffect } from "react";
import { trpc } from "../trpc";
import { GetWeightsResponse } from "../types";

export default function WeightList() {
  const { data, isLoading, isError, error } = trpc.getWeights.useQuery(undefined, {
    select: (data) => data as GetWeightsResponse,
  });

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log(`WeightList: Weights fetched for ${window.location.pathname}:`, data);
    }
    if (isError && error) {
      console.log(`WeightList: Weights fetch error for ${window.location.pathname}:`, error);
    }
  }, [data, isError, error]);

  if (isLoading) return <Box>Loading weights...</Box>;
  if (isError) return <Box>Error: {error?.message}</Box>;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Weight Entries</Typography>
      {data?.measurements.length === 0 ? (
        <Typography>No measurements</Typography>
      ) : (
        <List>
          {data?.measurements.map((entry) => (
            <ListItem key={entry.id}>
              <ListItemText
                primary={`${entry.weightKg} kg`}
                secondary={new Date(entry.createdAt).toLocaleDateString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}