// src/hooks/useAccountMutations.ts
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "../store";
import { trpc } from "../trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../netlify/functions/router";

export const useAccountMutations = () => {
  const [error, setError] = useState("");
  const { clearUser } = useStore();
  const navigate = useNavigate();

  const deleteAccount = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      setError("");
      clearUser();
      navigate({ to: "/login" });
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "UNAUTHORIZED") {
        setError("Session expired. Please log in again.");
        clearUser();
        navigate({ to: "/login" });
      } else {
        setError("Failed to delete account: " + err.message);
      }
    },
  });

  return { deleteAccount, error, setError };
};
