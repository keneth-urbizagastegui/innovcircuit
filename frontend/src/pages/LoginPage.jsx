import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';

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
      // Mostrar mensajes más claros según el tipo de error
      if (err?.response) {
        if (err.response.status === 401) {
          setError('Credenciales inválidas. Inténtalo de nuevo.');
        } else {
          const backendMsg = typeof err.response.data === 'string' ? err.response.data : '';
          setError(backendMsg || `Error del servidor (${err.response.status}). Inténtalo más tarde.`);
        }
      } else {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" gutterBottom>
          Iniciar Sesión
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained">Entrar</Button>
      </Box>
    </Container>
  );
};

export default LoginPage;