import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, Avatar, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';

const PerfilPage = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await usuarioService.actualizarMiPerfil({ nombre, avatarUrl });
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al actualizar el perfil.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Mi Perfil</Typography>
      <Divider sx={{ mb: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={avatarUrl} alt={nombre || 'Usuario'} />
          <Typography variant="subtitle1">{user?.email}</Typography>
        </Box>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <TextField
          label="URL del Avatar"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PerfilPage;