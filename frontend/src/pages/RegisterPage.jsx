import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('CLIENTE'); // Rol por defecto
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const userData = { nombre, email, password, rol };
    try {
      const response = await authService.register(userData);
      setSuccess('¡Registro exitoso! Serás redirigido al Login.');
      // Espera 2 segundos y redirige al login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error del backend (ej: email duplicado)
      setError(err.response?.data || 'Error en el registro. Inténtalo de nuevo.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Registro de Nuevo Usuario</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Nombre:&nbsp;</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Email:&nbsp;</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Password:&nbsp;</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Rol:&nbsp;</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="CLIENTE">Cliente (Quiero comprar)</option>
            <option value="PROVEEDOR">Proveedor (Quiero vender)</option>
          </select>
        </div>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
};

export default RegisterPage;