export const formatters = {
  currency: (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  },

  number: (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  },

  date: (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  },

  time: (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },

  percentage: (value) => {
    return `${(value * 100).toFixed(2)}%`;
  },
};


// ============== src/utils/validators.js ==============
export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone.replace(/\D/g, ''));
  },

  password: (password) => {
    return password.length >= 8;
  },

  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },
};