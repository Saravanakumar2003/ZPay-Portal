import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { user, role } = useAuth();

  if (user === undefined) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && role !== requiredRole) {
    return <div>Access Denied</div>;
  }

  return children;
}

export default ProtectedRoute;
