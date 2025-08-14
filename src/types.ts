// src/types.ts
export interface WeightMeasurement {
  id: number;
  weightKg: number;
  createdAt: string;
  updatedAt: string; // Required, as per the error
}

export type GetWeightsResponse = {
  measurements: WeightMeasurement[];
};

export interface AddWeightResponse {
  message: string;
}