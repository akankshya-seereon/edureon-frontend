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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch (e) { localStorage.removeItem('user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, instituteCode, roleType) => {
    try {
      const response = await authService.login({ email, password, instituteCode, roleType });
      const loggedInUser = response.data || response.admin || response.user || {};
      const normalizedUser = { ...loggedInUser, role: loggedInUser.role || roleType };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed.';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try { await authService.logout(); } catch (err) { console.error(err); }
    finally {
      localStorage.removeItem('user');
      localStorage.removeItem('impersonated_institute');
      localStorage.removeItem('managed_institute_id');
      localStorage.removeItem('managed_institute_name');
      setUser(null);
      setImpersonatedInstitute(null);
    }
  };

  const startImpersonation = (institute, navigate) => {
    localStorage.removeItem('impersonated_institute');
    localStorage.removeItem('managed_institute_id');
    localStorage.removeItem('managed_institute_name');
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