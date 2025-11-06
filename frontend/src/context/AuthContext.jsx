import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return null;
    try {
      return jwtDecode(savedToken);
    } catch (err) {
      console.warn('Token inválido, no se pudo decodificar.', err);
      return null;
    }
  });

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      setUser(jwtDecode(newToken));
    } catch (err) {
      console.error('Error al decodificar el token en login:', err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Mantener API compatible: función que devuelve booleano
  const isAuthenticated = () => {
    return token != null;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};