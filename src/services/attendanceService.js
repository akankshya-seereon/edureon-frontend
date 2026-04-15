import api from './api';

export const attendanceService = {
  // Faculty: Punch IN/OUT
  punch: async (type) => {
    const res = await api.post('/attendance/punch', { type });
    return res.data;
  },

  // Faculty: Unlock a session for students
  approveSession: async (sessionData) => {
    const res = await api.post('/attendance/session/approve', sessionData);
    return res.data;
  },

  // Student: Get sessions unlocked by faculty today
  getAvailableSessions: async () => {
    const res = await api.get('/attendance/sessions/available');
    return res.data;
  },

  // Student: Mark self as Present/Absent
  markAttendance: async (sessionId, status) => {
    const res = await api.post('/attendance/mark', { sessionId, status });
    return res.data;
  }
};