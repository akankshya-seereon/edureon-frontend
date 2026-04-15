import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🕵️‍♂️ DEBUG LOGS
  console.log("🛡️ [Guard Check] Path:", location.pathname);
  console.log("🛡️ [Guard Check] User:", user);
  console.log("🛡️ [Guard Check] Role:", user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🎯 DOOR 1: No User Found
  if (!user) {
    console.warn("❌ Guard: No user object found. Bouncing to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize roles for safe comparison
  const userRole = user.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase());
  
  // 🎯 DOOR 2: Standard Role Check
  let isAllowed = normalizedAllowedRoles?.includes(userRole);

  // ==========================================
  // 🚀 🎯 DOOR 3: THE SUPER ADMIN VIP PASS
  // ==========================================
  // If the route is meant for an 'admin', but a 'superadmin' is knocking, let them in!
  if (userRole === 'superadmin' && normalizedAllowedRoles?.includes('admin')) {
    isAllowed = true;
    console.log("🎟️ Guard: VIP Pass used! Super Admin entering Admin territory.");
  }
  // ==========================================

  if (allowedRoles && !isAllowed) {
    console.error(`🚫 Guard: Role '${user.role}' not in allowed list [${allowedRoles}]`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Guard: Access Granted!");
  return children;
};

export default ProtectedRoute;