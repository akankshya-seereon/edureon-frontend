import api from './api';

export const adminService = {
  // ====================================================
  // 👑 SUPER ADMIN METHODS (Institute Management)
  // ====================================================

  getInstitutes: async () => {
    const response = await api.get('/superadmin/institutes');
    return response.data;
  },

  // 👇 NEW: Added this to fetch the full profile data 👇
  getInstituteById: async (id) => {
    const response = await api.get(`/superadmin/institutes/${id}`);
    return response.data;
  },

  createInstitute: async (instituteData) => {
    // This sends the full JSON form data to your backend
    const response = await api.post('/superadmin/institutes', instituteData);
    return response.data;
  },

  updateInstituteStatus: async (id, isActive) => {
    // FIXED: Changed { status } to { is_active: isActive } to match backend controller!
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