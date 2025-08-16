// src/store/index.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WeightMeasurement = { id: string; weightKg: number; createdAt: string; note?: string | null };
type GoalData = {
  goalWeightKg: number | null;
  startWeightKg: number | null;
  goalSetAt?: string | null;
  latestWeightKg?: number | null;
};
type TrendPoint = { x: string; y: number };
type GetWeightTrendsResponse = {
  trendPoints?: TrendPoint[];
  trendSlope?: number | null;
  weeklyAverages?: { week?: string; date?: string; averageWeightKg: number }[];
  monthlyAverages?: { month?: string; date?: string; averageWeightKg: number }[];
  rateOfChange?: number | null;
};

interface AppState {
  user: { token: string; email: string } | null;
  measurements: WeightMeasurement[] | null;
  goal: GoalData | null;
  trends: GetWeightTrendsResponse | null;
  setUser: (user: { token: string; email: string } | null) => void;
  clearUser: () => void;
  setMeasurements: (measurements: WeightMeasurement[] | null) => void;
  setGoal: (goal: GoalData | null) => void;
  setTrends: (trends: GetWeightTrendsResponse | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      measurements: null,
      goal: null,
      trends: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setMeasurements: (measurements) => set({ measurements }),
      setGoal: (goal) => set({ goal }),
      setTrends: (trends) => set({ trends }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);