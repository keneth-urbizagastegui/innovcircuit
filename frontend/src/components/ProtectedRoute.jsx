import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // isAuthenticated es función en nuestro contexto
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si 'allowedRoles' existe y el rol del usuario no está incluido
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />; // O redirigir a una página de "No Autorizado"
  }

  return <Outlet />; // El usuario está autenticado y autorizado
};

export default ProtectedRoute;