import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set up axios defaults whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      loadUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Load user data from token
  const loadUser = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/profile');
      console.log('Profile loaded:', data);
      setUser(data);
      setError(null);
    } catch (err) {
      console.error('Authentication error:', err.response?.data || err.message);
      setError('Authentication error. Please login again.');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    console.log('Starting registration with updated endpoint:', { ...userData, password: '****' });
    try {
      setIsLoading(true);
      const { data } = await axios.post('/register', userData);
      console.log('Registration successful, received data:', { ...data, token: '****' });

      if (data.success && data.token) {
        setToken(data.token);
        setError(null);
        return true;
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      console.error('Error response:', err.response?.data || 'No response data');

      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';

      console.error('Setting error message:', errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('Login attempt for:', email);
      const { data } = await axios.post('/login', { email, password });
      console.log('Login successful, received data:', { ...data, token: '****' });

      if (data.success && data.token) {
        setToken(data.token);
        setError(null);
        return true;
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';

      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 