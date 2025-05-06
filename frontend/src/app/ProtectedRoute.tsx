// src/app/ProtectedRoute.tsx
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - accessToken:", accessToken);
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
