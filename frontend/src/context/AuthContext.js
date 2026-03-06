import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = 'http://127.0.0.1:8000/api/accounts/';

export const AuthProvider = ({ children }) => {
  // Look for the username in localStorage
  const [user, setUser] = useState(localStorage.getItem('username'));

  const login = async (email, password) => {
    try {
      // Send the email and password to Django
      const response = await axios.post(`${API_URL}login/`, {
        email,
        password
      });
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Django is sending the username back to us, save it so the blog author checks still work!
      localStorage.setItem('username', response.data.username); 
      
      // Just set the user! (Removed the broken setIsAuthenticated line)
      setUser(response.data.username);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.non_field_errors?.[0] || 'Invalid email or password' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post(`${API_URL}register/`, { username, email, password });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data ? Object.values(error.response.data)[0] : 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear the username on logout
    localStorage.removeItem('username');
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);