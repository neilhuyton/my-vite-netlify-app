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
  measurement: WeightMeasurement;
}

export interface AuthResponse {
  token: string;
  user: { id: number; email: string };
}

export interface SignupResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}
