import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUser, homePathForRole, isAuthenticated, type Role } from "../lib/session";

interface ProtectedRouteProps {
  /** Peran yang boleh masuk. Kosong berarti semua yang sudah login. */
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const user = getUser();

  // Belum login
  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Sudah login tapi perannya tidak cocok: arahkan ke halaman miliknya
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}