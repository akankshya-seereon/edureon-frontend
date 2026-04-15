import { useState, useEffect } from 'react';

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock data for different endpoints
    const mockData = {
      '/admin/dashboard': {
        faculty_count: 15,
        student_count: 245,
      },
      '/super-admin/dashboard': {
        institutes: { total: 156, active: 138, suspended: 12 },
        users: { teachers: 2450, students: 48530 },
      },
    };

    try {
      setLoading(true);
      setTimeout(() => {
        const result = mockData[url] || {};
        setData(result);
        setError(null);
      }, 500);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error };
};

