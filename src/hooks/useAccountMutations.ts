// src/hooks/useAccountMutations.ts
import { trpc } from "../trpc";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";

export function useAccountMutations() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const deleteAccount = trpc.account.deleteAccount.useMutation({
    onSuccess: () => {
      logout();
      navigate({ to: "/login" });
    },
    onError: (error) => {
      return error.message || "Failed to delete account";
    },
  });

  const updatePassword = trpc.account.updatePassword.useMutation({
    onError: (error) => {
      return error.message || "Failed to update password";
    },
  });

  const updateEmail = trpc.account.updateEmail.useMutation({
    onError: (error) => {
      return error.message || "Failed to update email";
    },
  });

  return {
    deleteAccount,
    updatePassword,
    updateEmail,
    error: deleteAccount.error?.message || updatePassword.error?.message || updateEmail.error?.message,
  };
}