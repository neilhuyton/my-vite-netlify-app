// src/hooks/useWeightMutations.ts
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "../store";
import { trpc, queryClient } from "../trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export const useWeightMutations = () => {
  const [error, setError] = useState("");
  const { clearUser } = useStore();
  const navigate = useNavigate();

  const addWeight = trpc.weight.addWeight.useMutation({
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        setError("Session expired. Please log in again.");
        clearUser();
        navigate({ to: "/login" });
      } else {
        setError(err.message);
      }
    },
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["weight", "getWeights"] });
      queryClient.invalidateQueries({ queryKey: ["trend", "getWeightTrends"] });
    },
  });

  return { addWeight, error, setError };
};
