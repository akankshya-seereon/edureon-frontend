import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [impersonatedInstitute, setImpersonatedInstitute] = useState(() => {
    try {
      const stored = localStorage.getItem('impersonated_institute');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Load user on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, instituteCode, roleType) => {
    try {
      const response = await authService.login({ email, password, instituteCode, roleType });
      
      // 🚀 FIXED: Handle nested data correctly based on your authService
      const userData = response.user || response.data || response.admin || {};
      
      // 🚀 CRITICAL: Force the role to lowercase here so the whole app is in sync
      const normalizedRole = String(userData.role || userData.designation || roleType).toLowerCase().trim();

      const normalizedUser = { 
        ...userData, 
        role: normalizedRole 
      };

      // Update State & Storage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('role', normalizedRole);
      setUser(normalizedUser);

      // 🚀 FIXED: Return the FULL response so LoginForm can see response.success
      return response; 
      
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed.';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('impersonated_institute');
      localStorage.removeItem('managed_institute_id');
      localStorage.removeItem('managed_institute_name');
      setUser(null);
      setImpersonatedInstitute(null);
      window.location.href = '/login';
    }
  };

  const startImpersonation = (institute, navigate) => {
    const payload = {
      id: institute.id,
      name: institute.name || institute.organisation?.name || 'Unknown Institute',
    };
    localStorage.setItem('impersonated_institute', JSON.stringify(payload));
    localStorage.setItem('managed_institute_id', String(institute.id));
    localStorage.setItem('managed_institute_name', payload.name);
    setImpersonatedInstitute(payload);
    navigate('/admin/dashboard');
  };

  const stopImpersonation = (navigate) => {
    localStorage.removeItem('impersonated_institute');
    localStorage.removeItem('managed_institute_id');
    localStorage.removeItem('managed_institute_name');
    setImpersonatedInstitute(null);
    navigate('/super-admin/dashboard');
  };

  const isImpersonating = user?.role === 'super_admin' && impersonatedInstitute !== null;

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      impersonatedInstitute, isImpersonating,
      startImpersonation, stopImpersonation,
    }}>
      {children}
    </AuthContext.Provider>
  );
};