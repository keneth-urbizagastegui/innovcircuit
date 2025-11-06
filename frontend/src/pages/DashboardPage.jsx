import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';
import { Typography, Box, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Alert } from '@mui/material';

const DashboardPage = () => {
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    if (user?.rol === 'CLIENTE') {
      usuarioService.getMisCompras()
        .then(res => setCompras(res.data))
        .catch(err => setError('Error al cargar compras'))
        .finally(() => setLoading(false));
    } else if (user?.rol === 'PROVEEDOR') {
      usuarioService.getMisDisenos()
        .then(res => setDisenos(res.data))
        .catch(err => setError('Error al cargar diseños'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Mi Panel</Typography>
      <Typography variant="h6">Hola, {user?.sub}</Typography>

      {user?.rol === 'CLIENTE' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Historial de Compras</Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {compras.length === 0 ? <Typography>No has realizado compras.</Typography> : null}
            {compras.map(compra => (
              <ListItem key={compra.id} divider>
                <ListItemText
                  primary={`Compra ID: ${compra.id} - Total: $${Number(compra.montoTotal).toFixed(2)}`}
                  secondary={`Fecha: ${new Date(compra.fecha).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {user?.rol === 'PROVEEDOR' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Mis Diseños Subidos</Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {disenos.length === 0 ? <Typography>No has subido diseños.</Typography> : null}
            {disenos.map(diseno => (
              <ListItem key={diseno.id} divider>
                <ListItemText
                  primary={diseno.nombre}
                  secondary={`Estado: ${diseno.estado} | Precio: $${Number(diseno.precio ?? 0).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default DashboardPage;