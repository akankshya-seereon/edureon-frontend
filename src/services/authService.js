import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const { email, password, instituteCode, roleType } = credentials;
      
      let endpoint = ''; 
      const normalizedRole = roleType?.toLowerCase();

      if (normalizedRole === 'super_admin' || normalizedRole === 'super') {
        endpoint = '/superadmin/auth/login';
      } 
      else if (normalizedRole === 'institute_admin' || normalizedRole === 'admin') {
        endpoint = '/admin/auth/login'; 
      }
      else if (normalizedRole === 'faculty') {
        endpoint = '/faculty/auth/login';
      }
      else if (normalizedRole === 'student') {
        endpoint = '/student/auth/login';
      }

      console.log(`🚀 [${normalizedRole.toUpperCase()}] Login Request to:`, endpoint);

      // 🎯 CRITICAL: withCredentials ensures the browser accepts the HTTP-Only cookie
      const response = await api.post(endpoint, { 
        email, 
        password, 
        instituteCode, 
        roleType 
      }, { withCredentials: true });

      const responseData = response.data;
      
      console.log("📦 Backend Response Received:", responseData.success ? "SUCCESS" : "FAILED");

      if (responseData.success) {
        // 1. Handle User Data (Faculty returns 'user', others might return 'admin' or 'data')
        const userData = responseData.user || responseData.data || responseData.admin;
        
        // 2. Handle Token (Faculty uses Cookies, so token will be undefined here)
        const token = responseData.token || responseData.accessToken;

        // 3. Update LocalStorage for UI purposes
        if (token) {
          localStorage.setItem('token', token); // For non-cookie roles
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', normalizedRole); 
        if (instituteCode) localStorage.setItem('instituteCode', instituteCode);

        console.log("✅ Login flow completed. Redirecting...");
      }
      
      return responseData;

    } catch (error) {
      const message = error.response?.data?.message || "Server connection failed";
      console.error("❌ AuthService Login Error:", message);
      throw error; 
    }
  },

  logout: async () => {
    try {
      const role = localStorage.getItem('role');
      
      // 🎯 IMPORTANT: Call the backend logout to clear the HTTP-Only cookie
      if (role === 'faculty') {
        await api.post('/faculty/auth/logout', {}, { withCredentials: true });
      } else if (role === 'super_admin') {
        await api.post('/superadmin/auth/logout');
      }
    } catch (err) {
      console.error("Logout API call failed, clearing local storage anyway.", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('instituteCode');
      window.location.href = '/login'; // Force redirect to login page
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),
  
  getRole: () => localStorage.getItem('role')
};

export default authService;