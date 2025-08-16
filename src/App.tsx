// src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "./context/AuthContext";
import { queryClient } from "./trpc";
import { router } from "./router";

export const App = () => {
  console.log("App.tsx: Rendering App component");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
};