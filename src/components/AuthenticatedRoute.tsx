// src/components/AuthenticatedRoute.tsx
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { ReactNode, useEffect } from "react";

export function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  console.log("AuthenticatedRoute.tsx: Current user:", user);
  console.log("AuthenticatedRoute.tsx: Current pathname:", pathname);

  useEffect(() => {
    if (!user && pathname !== "/login") {
      console.log("AuthenticatedRoute.tsx: User not authenticated, redirecting to /login");
      navigate({ to: "/login" });
    } else if (user) {
      console.log("AuthenticatedRoute.tsx: User authenticated, rendering children");
    }
  }, [user, navigate, pathname]);

  if (!user) {
    console.log("AuthenticatedRoute.tsx: Rendering loading state");
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}