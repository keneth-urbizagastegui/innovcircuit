import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  // Estilos simples en línea por ahora
  const navStyle = {
    display: 'flex',
    gap: '20px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    alignItems: 'center',
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <Link to="/">Home</Link>
      {auth.isAuthenticated() ? (
        <>
          {/* Aquí pondremos enlaces de Perfil, Subir Diseño, etc. */}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;