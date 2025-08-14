// src/components/AuthenticatedRoute.tsx
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";

export function AuthenticatedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return <>{children}</>;
}
