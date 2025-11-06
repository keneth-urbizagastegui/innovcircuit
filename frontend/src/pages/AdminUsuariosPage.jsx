import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import adminUsuariosService from '../services/adminUsuariosService';

const AdminUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarUsuarios = () => {
    setLoading(true);
    setError('');
    adminUsuariosService.listarUsuarios()
      .then(res => setUsuarios(res.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleToggleEstado = (usuario) => {
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    adminUsuariosService.actualizarEstado(usuario.id, nuevoEstado)
      .then(() => cargarUsuarios())
      .catch(() => setError('No se pudo actualizar el estado del usuario'));
  };

  const handleEliminar = (usuario) => {
    const ok = window.confirm(`¿Eliminar usuario ${usuario.nombre} (${usuario.email})?`);
    if (!ok) return;
    adminUsuariosService.eliminarUsuario(usuario.id)
      .then(() => cargarUsuarios())
      .catch(() => setError('No se pudo eliminar el usuario'));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Gestionar Usuarios</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.nombre}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.rol}</TableCell>
              <TableCell>{u.estado}</TableCell>
              <TableCell align="right">
                <Button variant="contained" color={u.estado === 'ACTIVO' ? 'warning' : 'success'} sx={{ mr: 1 }} onClick={() => handleToggleEstado(u)}>
                  {u.estado === 'ACTIVO' ? 'Bloquear' : 'Activar'}
                </Button>
                <Button variant="contained" color="error" onClick={() => handleEliminar(u)}>Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AdminUsuariosPage;