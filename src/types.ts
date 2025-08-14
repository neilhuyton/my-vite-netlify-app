// src/types.ts
export interface WeightMeasurement {
  id: number;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
}

export type GetWeightsResponse = {
  measurements: WeightMeasurement[];
};

export interface AddWeightResponse {
  message: string;
}