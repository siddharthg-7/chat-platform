import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/accounts/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/accounts/signup/', userData);
    return response.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await api.post('/accounts/logout/', { refresh });
      } catch (error) {
        console.error('Logout error', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getProfile: async () => {
    const response = await api.get('/accounts/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/accounts/profile/', data);
    return response.data;
  },

  updateProfileDetails: async (formData) => {
    const response = await api.patch('/accounts/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

