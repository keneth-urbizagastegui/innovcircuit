import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  const isAuth = isAuthenticated();

  // Usamos useEffect para disparar el toast solo una vez y evitar loops o renders con efectos secundarios
  // Sin embargo, al renderizar <Navigate> inmediatamente, el componente se desmonta.
  // Para que el toast se vea, debe dispararse antes de retornar el Navigate o usar un efecto que se ejecute antes.
  // En React Router v6, Navigate es un componente.
  // Una forma limpia es mostrar el toast justo antes de renderizar el Navigate.
  
  if (!isAuth) {
    // Evitar disparar el toast en cada render si ya estamos redirigiendo, 
    // pero como el componente se desmontará al redirigir, un simple flag o un useEffect al montar podría no ser suficiente si la redirección es inmediata.
    // La forma más sencilla es dispararlo aquí, pero cuidando no hacerlo en loop.
    // Dado que <Navigate> cambia la ruta, este componente dejará de renderizarse, así que está bien.
    // PERO: React advierte sobre updates durante el render. 
    // Mejor usar un pequeño componente wrapper o un efecto si queremos ser puristas.
    // Por simplicidad y UX inmediata:
    
    // Hack común: setTimeout 0 para sacarlo del ciclo de render actual
    setTimeout(() => toast.error("Debes iniciar sesión para acceder a esta sección"), 0);
    return <Navigate to="/login" replace />;
  }

  // Si 'allowedRoles' existe y el rol del usuario no está incluido
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    setTimeout(() => toast.warning("No tienes permisos para acceder a esta sección"), 0);
    return <Navigate to="/" replace />; 
  }

  return <Outlet />; // El usuario está autenticado y autorizado
};

export default ProtectedRoute;