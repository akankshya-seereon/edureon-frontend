import api from './api';

export const getAttendance = async () => {
  const response = await api.get('/student/attendance/stats');
  return response.data;
};