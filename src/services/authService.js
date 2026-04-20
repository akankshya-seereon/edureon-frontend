import api from './api';

export const authService = {
  // ─── LOGIN ───
  // Note: Supporting both object and separate arguments just in case useAuth passes them differently
  login: async (emailOrCreds, passwordParam, instituteCodeParam, roleTypeParam) => {
    try {
      // Safely extract credentials whether passed as an object or as individual arguments
      let email, password, instituteCode, roleType;
      if (typeof emailOrCreds === 'object') {
        ({ email, password, instituteCode, roleType } = emailOrCreds);
      } else {
        email = emailOrCreds;
        password = passwordParam;
        instituteCode = instituteCodeParam;
        roleType = roleTypeParam;
      }
      
      let endpoint = ''; 
      const normalizedRole = roleType?.toLowerCase() || '';

      // 🚀 CRITICAL FIX: Map ALL roles to their correct API endpoints
      switch (normalizedRole) {
        case 'super_admin':
        case 'super':
          endpoint = '/superadmin/auth/login';
          break;
        case 'institute_admin':
        case 'admin':
          // This is strictly for the top-level Institute Admin/Owner
          endpoint = '/admin/auth/login'; 
          break;
        case 'employee':
        case 'faculty':
        case 'hod':
        case 'principal':
        case 'accountant':
        case 'staff':
          // 🚀 UNIFIED EMPLOYEE LOGIN: All academic and non-academic staff go through here!
          // The backend will check their designation and return their TRUE role.
          endpoint = '/faculty/auth/login';
          break;
        case 'student':
          endpoint = '/student/auth/login';
          break;
        default:
          throw new Error(`Unrecognized login role: ${normalizedRole}`);
      }

      console.log(`🚀 [${normalizedRole.toUpperCase()}] Login Request to:`, endpoint);

      // 🎯 FAIL-SAFE PAYLOAD: We send both camelCase and snake_case for the institute code.
      const payload = {
        email: email, 
        password: password, 
        instituteCode: instituteCode,       // camelCase
        institute_code: instituteCode,      // snake_case
        roleType: normalizedRole
      };

      // Send the request with credentials (for HTTP-Only cookies)
      const response = await api.post(endpoint, payload, { withCredentials: true });
      const responseData = response.data;
      
      console.log("📦 Backend Response Received:", responseData.success ? "SUCCESS" : "FAILED");

      if (responseData.success) {
        // 1. Handle User Data safely
        const userData = responseData.user || responseData.data || responseData.admin || {};
        
        // 2. Handle Token (Some roles use Cookies, others might return a token string)
        const token = responseData.token || responseData.accessToken;

        // 🚀 3. THE MAGIC: Extract the TRUE role assigned by the backend database
        const actualRole = userData.role || normalizedRole;

        // 4. Update LocalStorage for UI purposes
        if (token) {
          localStorage.setItem('token', token);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', actualRole); // Save the true role (e.g., 'principal') instead of just 'employee'
        if (instituteCode) localStorage.setItem('instituteCode', instituteCode);

        console.log(`✅ Login flow completed. User verified as: [${actualRole.toUpperCase()}]`);
      }
      
      return responseData;

    } catch (error) {
      const message = error.response?.data?.message || error.message || "Server connection failed";
      console.error("❌ AuthService Login Error:", message);
      throw error; 
    }
  },

  // ─── LOGOUT ───
  logout: async () => {
    try {
      const role = localStorage.getItem('role');
      const normalizedRole = role?.toLowerCase() || '';
      
      // 🎯 IMPORTANT: Call the correct backend logout to clear HTTP-Only cookies
      if (['employee', 'faculty', 'hod', 'principal', 'accountant', 'staff'].includes(normalizedRole)) {
        // All staff log out through the unified route
        await api.post('/faculty/auth/logout', {}, { withCredentials: true });
      } 
      else if (['institute_admin', 'admin'].includes(normalizedRole)) {
        await api.post('/admin/auth/logout', {}, { withCredentials: true });
      }
      else if (['super_admin', 'super'].includes(normalizedRole)) {
        await api.post('/superadmin/auth/logout', {}, { withCredentials: true });
      }
      else if (normalizedRole === 'student') {
        await api.post('/student/auth/logout', {}, { withCredentials: true });
      }
    } catch (err) {
      console.error("Logout API call failed, clearing local storage anyway.", err);
    } finally {
      // Always wipe local data even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('instituteCode');
      window.location.href = '/login'; // Force redirect to login page
    }
  },

  // ─── UTILS ───
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),
  
  getRole: () => localStorage.getItem('role')
};

export default authService;