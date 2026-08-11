import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import type { RootState } from "../app/store";
import { toast } from "react-toastify";
import { useEffect } from "react";

const AdminRoute = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
