import api from './api';

export const adminService = {
  // ====================================================
  // 👑 SUPER ADMIN METHODS (Institute Management)
  // ====================================================

  getInstitutes: async () => {
    const response = await api.get('/superadmin/institutes');
    return response.data;
  },

  getInstituteById: async (id) => {
    const response = await api.get(`/superadmin/institutes/${id}`);
    return response.data;
  },

  createInstitute: async (instituteData) => {
    // 🚀 CRITICAL FIXES FOR 401 & FILE UPLOADS:
    // 1. Check if you are storing the token in local storage
    const token = localStorage.getItem('token'); 

    const config = {
      headers: {
        // Tell the backend to expect physical files
        'Content-Type': 'multipart/form-data',
        // If you use LocalStorage, send it here:
        ...(token && { 'Authorization': `Bearer ${token}` }) 
      },
      // If you use HTTP-Only Cookies (which your backend supports), force Axios to send them:
      withCredentials: true 
    };

    // Pass the config object as the third argument
    const response = await api.post('/superadmin/institutes', instituteData, config);
    return response.data;
  },

  updateInstituteStatus: async (id, isActive) => {
    const response = await api.patch(`/superadmin/institutes/${id}/status`, { 
      is_active: isActive 
    });
    return response.data;
  },

  deleteInstitute: async (id) => {
    const response = await api.delete(`/superadmin/institutes/${id}`);
    return response.data;
  },

  // ====================================================
  // 🏫 INSTITUTE ADMIN METHODS (People & Academics)
  // ====================================================

  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getFacultyList: async () => {
    const response = await api.get('/admin/faculty');
    return response.data;
  },

  getStudentList: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  createStudent: async (data) => {
    const response = await api.post('/admin/students', data);
    return response.data;
  },
};