// src/App.tsx
import { useState } from "react";
import { trpc } from "./trpc";
import "./App.css";
import { useQueryClient } from "@tanstack/react-query";

interface WeightMeasurement {
  id: number;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
}

interface GetWeightsResponse {
  message: string;
  measurements: WeightMeasurement[];
}

interface AddWeightResponse {
  message: string;
  measurement: WeightMeasurement;
}

function App() {
  const [weight, setWeight] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = trpc.getWeights.useQuery();
  const mutation = trpc.addWeight.useMutation({
    onMutate: async ({ weightKg }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["getWeights"] });

      // Get the previous data
      const previousData = queryClient.getQueryData<GetWeightsResponse>([
        "getWeights",
      ]);

      // Optimistically update the cache
      queryClient.setQueryData<GetWeightsResponse>(["getWeights"], (old) => {
        if (!old) return { message: "Weights fetched", measurements: [] };
        const optimisticMeasurement: WeightMeasurement = {
          id: Math.random(), // Temporary ID (will be replaced by server ID)
          weightKg,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...old,
          measurements: [optimisticMeasurement, ...old.measurements],
        };
      });

      // Return context for rollback in case of error
      return { previousData };
    },
    onSuccess: (data) => {
      setWeight("");
      setErrorMessage("");
      // Update cache with actual server response
      queryClient.setQueryData<GetWeightsResponse>(["getWeights"], (old) => {
        if (!old)
          return { message: data.message, measurements: [data.measurement] };
        return {
          ...old,
          message: data.message,
          measurements: [
            data.measurement, // Add the actual measurement from server
            ...old.measurements.filter((m) => m.id !== Math.random()), // Remove optimistic entry
          ],
        };
      });
      // Optionally, invalidate to refetch for consistency
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
    },
    onError: (err, _variables, context) => {
      console.error("Mutation error:", err);
      setErrorMessage(`Failed to add weight: ${err.message}`);
      // Rollback to previous data on error
      queryClient.setQueryData(["getWeights"], context?.previousData);
    },
    onSettled: () => {
      // Ensure cache is consistent after mutation
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const weightNum = parseFloat(weight);
    if (!isNaN(weightNum) && weightNum >= 0.1) {
      mutation.mutate({ weightKg: weightNum });
    } else {
      setErrorMessage("Please enter a valid weight (at least 0.1 kg)");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const response = data as GetWeightsResponse;

  return (
    <div className="App">
      <h1>Vite + tRPC + Prisma + Netlify Functions</h1>
      <p>{response.message}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Enter weight in kg"
          required
        />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Add Weight"}
        </button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {mutation.isError && (
          <p style={{ color: "red" }}>Error: {mutation.error.message}</p>
        )}
        {mutation.isSuccess && <p>{mutation.data.message}</p>}
      </form>

      <h2>Weight Measurements:</h2>
      <ul>
        {response.measurements.map((measurement) => (
          <li key={measurement.id}>
            {measurement.weightKg} kg -{" "}
            {new Date(measurement.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
