import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2]">
        <div className="rounded-[8px] border border-zinc-200 bg-white px-8 py-6 text-center shadow-[0_10px_30px_rgba(24,24,27,0.04)]">
          <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-[8px] bg-zinc-100" />
          <p className="text-sm font-medium text-zinc-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
