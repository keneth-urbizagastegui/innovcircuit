import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Typography, Box, Paper, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';

const AdminDashboardPage = () => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarPendientes = () => {
    setLoading(true);
    setError('');
    adminService.getDisenosPendientes()
      .then(response => {
        setPendientes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar diseños pendientes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const handleAprobar = (id) => {
    adminService.aprobarDiseno(id)
      .then(() => cargarPendientes())
      .catch(() => setError('No se pudo aprobar el diseño.'));
  };

  const handleRechazar = (id) => {
    adminService.rechazarDiseno(id)
      .then(() => cargarPendientes())
      .catch(() => setError('No se pudo rechazar el diseño.'));
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
      <Typography variant="h6" gutterBottom>Diseños Pendientes de Revisión</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <List>
        {pendientes.length === 0 ? (
          <Typography>No hay diseños pendientes.</Typography>
        ) : (
          pendientes.map(diseno => (
            <ListItem key={diseno.id} divider>
              <ListItemText
                primary={diseno.nombre}
                secondary={`Por: ${diseno.proveedor?.nombre || 'N/A'} | Categoría: ${diseno.nombreCategoria || 'N/A'}`}
              />
              <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleAprobar(diseno.id)}>
                Aprobar
              </Button>
              <Button variant="contained" color="error" onClick={() => handleRechazar(diseno.id)}>
                Rechazar
              </Button>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default AdminDashboardPage;