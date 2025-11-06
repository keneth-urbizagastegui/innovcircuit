import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.login({ email, password });
      // response.data contiene { token, tipo }
      auth.login(response.data.token);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;