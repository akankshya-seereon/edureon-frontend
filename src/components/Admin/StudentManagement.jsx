import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
  });

  // 🚀 DYNAMIC FETCH
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Smart token retrieval
      let token = localStorage.getItem('token'); 
      if (!token) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        token = storedUser?.token || storedUser?.data?.token; 
      }

      const response = await axios.get("http://localhost:5000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Map backend data to match the exact keys your UI expects
        const mappedStudents = response.data.students.map(s => ({
          ...s,
          full_name: s.name,
          // Convert status to lowercase so your green/red color check works
          status: (s.status || 'active').toLowerCase() 
        }));
        setStudents(mappedStudents);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Load students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // 🚀 DYNAMIC SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem('token'); 
      if (!token) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        token = storedUser?.token || storedUser?.data?.token; 
      }

      // Format data to satisfy your MySQL backend requirements behind the scenes
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.mobile,
        // Auto-generate missing required fields to keep your UI unchanged
        rollNo: `STU${Math.floor(Math.random() * 90000) + 10000}`,
        course: 'General', 
        batch_year: new Date().getFullYear().toString()
      };

      await axios.post("http://localhost:5000/api/admin/students", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and UI
      setFormData({ firstName: '', lastName: '', email: '', mobile: '' });
      setShowForm(false);
      
      // Refresh the table instantly
      fetchStudents(); 
      alert('Student created successfully');

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create student');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="tel"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Student
            </button>
          </form>
        </div>
      )}

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((student) => (
              <tr key={student.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{student.full_name}</td>
                <td className="px-6 py-3">{student.email}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded text-sm font-semibold capitalize ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};