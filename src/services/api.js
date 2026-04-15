import axios from 'axios';

const api = axios.create({
   baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // 1. Get the token (checking for normal token or superadmin token)
    const token = localStorage.getItem('token') || localStorage.getItem('superadmin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🚀 2. THE GHOST HEADER: Attach Impersonation ID if it exists
    const managedInstituteId = localStorage.getItem('managed_institute_id');
    if (managedInstituteId) {
      config.headers['x-managed-institute-id'] = managedInstituteId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Added optional chaining (?.) just to be safe if config is ever undefined
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // 🕵️‍♂️ LOUD LOGGING
    if (error.response && error.response.status === 401) {
      console.error("🚨 401 UNAUTHORIZED DETECTED!");
      console.error("🔗 Failed URL:", error.config?.url);
      console.error("🛡️ Role in Storage:", localStorage.getItem('role'));
      
      if (!isLoginRequest) {
        console.warn("🧹 401 Interceptor: Wiping data and bouncing to login...");
        
        // Clear standard auth data
        localStorage.removeItem('token');
        localStorage.removeItem('superadmin_token'); // Just in case!
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        // 🚀 Clear Impersonation Data so they don't get stuck on their next login!
        localStorage.removeItem('managed_institute_id');
        localStorage.removeItem('managed_institute_name');
        
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;