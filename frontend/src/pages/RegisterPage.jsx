import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" gutterBottom>
          Registro de Nuevo Usuario
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField
          label="Nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          fullWidth
        />
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
        <FormControl fullWidth>
          <InputLabel id="register-rol-label">Rol</InputLabel>
          <Select
            labelId="register-rol-label"
            label="Rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <MenuItem value="CLIENTE">Cliente (Quiero comprar)</MenuItem>
            <MenuItem value="PROVEEDOR">Proveedor (Quiero vender)</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">Registrarse</Button>
      </Box>
    </Container>
  );
};

export default RegisterPage;