import api from './api'; 

export const infrastructureService = {
  // 1. Fetch all data
  getInfrastructure: async () => {
    const response = await api.get('/admin/infrastructure');
    return response.data;
  },

  // 2. Create Methods
  createCampus: async (data) => {
    const response = await api.post('/admin/infrastructure/campuses', data);
    return response.data;
  },

  createBuilding: async (data) => {
    const response = await api.post('/admin/infrastructure/buildings', data);
    return response.data;
  },

  createRoom: async (data) => {
    const response = await api.post('/admin/infrastructure/rooms', data);
    return response.data;
  },

  // 3. Status Toggle (Active/Inactive)
  toggleStatus: async (type, id, activeStatus) => {
    const response = await api.put(`/admin/infrastructure/toggle/${type}/${id}`, { active: activeStatus });
    return response.data;
  },

  // 4. DELETE METHODS (Added to fix your errors)
  deleteCampus: async (id) => {
    const response = await api.delete(`/admin/infrastructure/campuses/${id}`);
    return response.data;
  },

  deleteBuilding: async (id) => {
    const response = await api.delete(`/admin/infrastructure/buildings/${id}`);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/admin/infrastructure/rooms/${id}`);
    return response.data;
  },

  // 5. UPDATE METHODS (Optional: for the Edit buttons)
  updateCampus: async (id, data) => {
    const response = await api.put(`/admin/infrastructure/campuses/${id}`, data);
    return response.data;
  },

  updateBuilding: async (id, data) => {
    const response = await api.put(`/admin/infrastructure/buildings/${id}`, data);
    return response.data;
  },

  updateRoom: async (id, data) => {
    const response = await api.put(`/admin/infrastructure/rooms/${id}`, data);
    return response.data;
  }
};