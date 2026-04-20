import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🕵️‍♂️ DEBUG LOGS - Keep these until we are 100% stable
  console.log("🛡️ [Guard Check] Path:", location.pathname);
  console.log("🛡️ [Guard Check] User Context:", user);
  console.log("🛡️ [Guard Check] Assigned Role:", user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Access...</p>
        </div>
      </div>
    );
  }

  // 🎯 DOOR 1: No User Found
  if (!user) {
    console.warn("❌ Guard: No session found. Redirecting to Login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚀 NORMALIZATION: Ensure comparison is bulletproof
  const userRole = String(user.role || "").toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles?.map(r => String(r).toLowerCase().trim()) || [];
  
  // 🎯 DOOR 2: Standard Role Check
  let isAllowed = normalizedAllowedRoles.includes(userRole);

  // ==========================================
  // 🚀 🎯 DOOR 3: THE SUPER ADMIN MASTER KEY
  // ==========================================
  // If the user is a super_admin (or superadmin), they get into EVERYTHING.
  if (userRole === 'super_admin' || userRole === 'superadmin') {
    isAllowed = true;
    console.log("🔑 Guard: Master Key detected. Accessing as Super Admin.");
  }

  // ==========================================
  // 🚀 🎯 DOOR 4: THE INSTITUTE ADMIN FALLBACK
  // ==========================================
  // If the route allows 'admin' but the role is 'institute_admin', let them in.
  if (userRole === 'institute_admin' && (normalizedAllowedRoles.includes('admin') || normalizedAllowedRoles.includes('institute_admin'))) {
    isAllowed = true;
  }
  // ==========================================

  if (allowedRoles && !isAllowed) {
    console.error(`🚫 Guard: Access Denied. Role '${userRole}' is not authorized for this path.`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(`✅ Guard: Access Granted for [${userRole.toUpperCase()}]`);
  return children;
};

export default ProtectedRoute;