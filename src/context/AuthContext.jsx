import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default axios base URL
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

  useEffect(() => {
    // Axios interceptor to catch unauthorized / concurrent login errors globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const isConcurrent = error.response.data?.code === 'CONCURRENT_LOGIN';
          
          setUser(null);
          localStorage.removeItem('userInfo');
          delete axios.defaults.headers.common['Authorization'];
          
          if (isConcurrent) {
            alert(
              localStorage.getItem('i18nextLng') === 'ar' || !localStorage.getItem('i18nextLng')
                ? 'تم تسجيل الخروج لأن حسابك قد فُتح على جهاز آخر.'
                : 'You have been logged out because your account was opened on another device.'
            );
          }
        }
        return Promise.reject(error);
      }
    );

    const initAuth = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        // Set token header first
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        try {
          // Fetch fresh data from server (this ensures role is always up to date)
          const { data } = await axios.get('/api/auth/me');
          const freshUser = { ...data, token: parsedUser.token };
          setUser(freshUser);
          localStorage.setItem('userInfo', JSON.stringify(freshUser));
        } catch (err) {
          // Token invalid/expired - clear storage
          localStorage.removeItem('userInfo');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setLoading(false);
      return true; // Success
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password');
      return false; // Failed
    }
  };

  const register = async (fullName, email, phoneNumber, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post('/api/auth/register', { 
        fullName, 
        email, 
        phoneNumber, 
        password 
      });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const updateUser = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.put('/api/auth/profile', updatedData);
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Update failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Optional: call backend logout to clear activeSessionId
      if (user?.token) {
        await axios.post('/api/auth/logout');
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
