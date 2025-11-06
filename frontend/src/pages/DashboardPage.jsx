import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';
import { Typography, Box, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import disenoService from '../services/disenoService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const recargarMisDisenos = () => {
    usuarioService.getMisDisenos()
      .then(res => setDisenos(res.data))
      .catch(() => setError('Error al cargar diseños'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (user?.rol === 'CLIENTE') {
      usuarioService.getMisCompras()
        .then(res => setCompras(res.data))
        .catch(err => setError('Error al cargar compras'))
        .finally(() => setLoading(false));
    } else if (user?.rol === 'PROVEEDOR') {
      recargarMisDisenos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleEliminarDiseno = (id) => {
    const ok = window.confirm('¿Eliminar este diseño? Esta acción no se puede deshacer.');
    if (!ok) return;
    disenoService.eliminarDiseno(id)
      .then(() => recargarMisDisenos())
      .catch(() => setError('No se pudo eliminar el diseño'));
  };

  const handleEditarDiseno = (id) => {
    // Opcional: navegar a una página de edición
    // Por ahora, se podría reutilizar SubirDisenoPage con parámetros o crear EditarDisenoPage.
    alert('Función de edición pendiente de implementación.');
  };

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
              <ListItem key={diseno.id} divider
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="editar" sx={{ mr: 1 }} onClick={() => handleEditarDiseno(diseno.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="eliminar" color="error" onClick={() => handleEliminarDiseno(diseno.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
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