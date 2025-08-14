// src/App.tsx
import { useState } from "react";
import { trpc } from "./trpc";
import { useQueryClient } from "@tanstack/react-query";
import {
  Chart as ChartJS,
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
import "chartjs-adapter-date-fns";
import "./App.css";

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
}

function App() {
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = trpc.getWeights.useQuery();
  const mutation = trpc.addWeight.useMutation({
    onSuccess: () => {
      setWeight("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["getWeights"] });
    },
    onError: (err) => setError(`Failed to add weight: ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (weightNum >= 0.1) {
      mutation.mutate({ weightKg: weightNum });
    } else {
      setError("Weight must be at least 0.1 kg");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {queryError.message}</div>;

  const measurements = data!.measurements.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = {
    datasets: [
      {
        label: "Weight (kg)",
        data: measurements.map((m) => ({
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

  const chartOptions = {
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const, tooltipFormat: "MMM d, yyyy" },
        title: { display: true, text: "Date" },
      },
      y: { title: { display: true, text: "Weight (kg)" }, beginAtZero: false },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: { label: (ctx: any) => `Weight: ${ctx.parsed.y} kg` },
      },
    },
  };

  return (
    <div className="App">
      <h1>Weight Tracker</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
          required
        />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Add"}
        </button>
        {(error || mutation.isError) && (
          <p style={{ color: "red" }}>{error || mutation.error!.message}</p>
        )}
        {mutation.isSuccess && <p>{mutation.data.message}</p>}
      </form>

      <h2>Measurements</h2>
      <ul>
        {measurements.map((m) => (
          <li key={m.id}>
            {m.weightKg} kg - {new Date(m.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>

      <h2>Weight Trend</h2>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default App;
