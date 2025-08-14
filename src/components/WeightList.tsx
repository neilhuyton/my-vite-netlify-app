// src/components/WeightList.tsx
import { List, ListItem, ListItemText, Typography, Box } from "@mui/material";
import { useEffect } from "react";
import { trpc } from "../trpc";
import { GetWeightsResponse } from "../types";

export default function WeightList() {
  const { data, isLoading, isError, error } = trpc.getWeights.useQuery(
    undefined,
    {
      select: (data) => data as GetWeightsResponse,
    }
  );

  useEffect(() => {
    if (data) {
      console.log(
        `WeightList: Weights fetched for ${window.location.pathname}:`,
        data
      );
    }
    if (isError && error) {
      console.log(
        `WeightList: Weights fetch error for ${window.location.pathname}:`,
        error
      );
    }
  }, [data, isError, error]);

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading weights...</Box>;
  if (isError)
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>Error: {error?.message}</Box>
    );

  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <Typography variant="h6">Weight Entries</Typography>
      {data?.measurements.length === 0 ? (
        <Typography sx={{ mt: 1 }}>No measurements</Typography>
      ) : (
        <List sx={{ width: "100%" }}>
          {data?.measurements.map((entry) => (
            <ListItem key={entry.id} sx={{ py: 1, width: "100%" }}>
              <ListItemText
                primary={`${entry.weightKg} kg`}
                secondary={new Date(entry.createdAt).toLocaleDateString()}
                primaryTypographyProps={{ fontSize: "1rem" }}
                secondaryTypographyProps={{ fontSize: "0.875rem" }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}