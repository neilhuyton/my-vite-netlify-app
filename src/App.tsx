// src/App.tsx
import { useState } from "react";
import { trpc } from "./trpc";
import "./App.css";
import { useQueryClient } from "@tanstack/react-query";
import {
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "chartjs-adapter-date-fns"; // For date handling in Chart.js

// Register Chart.js components
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

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
    onSuccess: () => {
      setWeight("");
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
    },
    onError: (err) => {
      console.error("Mutation error:", err);
      setErrorMessage(`Failed to add weight: ${err.message}`);
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

  // Sort measurements by createdAt date (earliest to latest)
  const sortedMeasurements = [...response.measurements].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Prepare data for Chart.js
  const chartData = {
    datasets: [
      {
        label: "Weight (kg)",
        data: sortedMeasurements.map((m) => ({
          x: new Date(m.createdAt),
          y: m.weightKg,
        })),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "day" as const,
          tooltipFormat: "MMM d, yyyy",
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Weight (kg)",
        },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Weight: ${context.parsed.y} kg`,
        },
      },
    },
  };

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
        {sortedMeasurements.map((measurement) => (
          <li key={measurement.id}>
            {measurement.weightKg} kg -{" "}
            {new Date(measurement.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>

      <h2>Weight Over Time:</h2>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default App;
