// src/Root.tsx
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { trpc, queryClient, createTRPCClient } from "./trpc";
import { router } from "./router";
import { useMemo } from "react";

const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const trpcClientWithHeaders = useMemo(
    () => createTRPCClient(user?.token || null, () => {
      logout();
    }),
    [user, logout]
  );

  return (
    <trpc.Provider client={trpcClientWithHeaders} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
};

export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TRPCProvider>
          <RouterProvider router={router} />
        </TRPCProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}