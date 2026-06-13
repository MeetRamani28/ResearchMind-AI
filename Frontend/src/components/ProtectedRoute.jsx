import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading, isError, socket } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user && socket && socket.connected) {
      socket.emit("join", user._id);
    }
  }, [user, socket]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-slate-950 text-indigo-600 font-bold">
        Loading...
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
export default ProtectedRoute;
