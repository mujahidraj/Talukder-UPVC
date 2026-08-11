import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop if refresh fails
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      
      try {
        const { user, setAuth, logout } = useAuthStore.getState();
        
        if (!user) {
          logout();
          return Promise.reject(error);
        }
        
        // This will automatically send the refreshToken cookie
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        const { user: updatedUser } = response.data;
        
        setAuth(updatedUser);
        
        // Retry the original request (cookies will be automatically included)
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
