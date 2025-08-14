// src/types.ts
export interface WeightMeasurement {
  id: number;
  weightKg: number;
  createdAt: string;
  updatedAt?: string; // Optional, as it's not used in the UI
}

export interface GetWeightsResponse {
  message: string;
  measurements: WeightMeasurement[];
}
