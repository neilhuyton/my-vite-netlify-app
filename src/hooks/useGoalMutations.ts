// src/hooks/useGoalMutations.ts
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "../store";
import { trpc } from "../trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export const useGoalMutations = () => {
  const [error, setError] = useState("");
  const { clearUser } = useStore();
  const navigate = useNavigate();

  const {
    data: goalData,
    refetch: refetchGoal,
    error: goalError,
  } = trpc.goal.getGoal.useQuery(undefined, {
    enabled: !!useStore.getState().user?.token,
  });

  const setGoal = trpc.goal.setGoal.useMutation({
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
      refetchGoal();
    },
  });

  const clearGoal = trpc.goal.clearGoal.useMutation({
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
      refetchGoal();
    },
  });

  useEffect(() => {
    if (goalError?.data?.code === "UNAUTHORIZED") {
      setError("Session expired. Please log in again.");
      clearUser();
      navigate({ to: "/login" });
    }
  }, [goalError, clearUser, navigate]);

  return { goalData, setGoal, clearGoal, error, setError, refetchGoal };
};
