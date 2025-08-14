// src/Root.tsx
import { RouterProvider } from "@tanstack/react-router";
import { trpc, queryClient } from "./trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { httpLink } from "@trpc/client";
import { router } from "./router";
import { useMemo } from "react";

// Component to handle TRPC client with auth token
const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  const trpcClientWithHeaders = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpLink({
            //url: '/.netlify/functions/trpc', // Use Netlify function endpoint
            url: "/api/trpc",
            headers: () => (token ? { Authorization: `Bearer ${token}` } : {}),
          }),
        ],
      }),
    [token]
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
