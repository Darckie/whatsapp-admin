import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Dashboard from "layouts/admin";
import AuthLayout from "layouts/auth";
import ProtectedRoute from "components/ProtectedRoute";
import { useAuth } from "context/AuthContext";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Navigate to={user ? "/admin/default" : "/auth/sign-in"} replace />;
};

const App = () => {
  return (
    <>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: 8,
            border: "1px solid #e4e4e7",
            boxShadow: "0 10px 30px rgba(24,24,27,0.08)",
          },
        }}
      />
    </>
  );
};

export default App;
