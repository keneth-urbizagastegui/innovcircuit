import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';
import { Typography, Box, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Alert, IconButton, Grid, Button, Modal } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import disenoService from '../services/disenoService';
import ConfirmDialog from '../components/ConfirmDialog';

const DashboardPage = () => {
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [reporteOpen, setReporteOpen] = useState(false);
  const [reporteJson, setReporteJson] = useState('');

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
      // Cargar estadísticas del proveedor
      setStatsLoading(true);
      setStatsError('');
      usuarioService.getMiDashboard()
        .then(res => setStats(res.data))
        .catch(() => setStatsError('Error al cargar estadísticas'))
        .finally(() => setStatsLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disenoAEliminar, setDisenoAEliminar] = useState(null);
  const solicitarEliminarDiseno = (id) => { setDisenoAEliminar(id); setConfirmOpen(true); };
  const confirmarEliminarDiseno = () => {
    if (!disenoAEliminar) return;
    disenoService.eliminarDiseno(disenoAEliminar)
      .then(() => recargarMisDisenos())
      .catch(() => setError('No se pudo eliminar el diseño'))
      .finally(() => { setConfirmOpen(false); setDisenoAEliminar(null); });
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
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={() => {
              usuarioService.getReporteMisCompras()
                .then(res => { setReporteJson(JSON.stringify(res.data, null, 2)); setReporteOpen(true); })
                .catch(() => { setReporteJson('Error al generar reporte de compras'); setReporteOpen(true); });
            }}>
              Generar Reporte de Mis Compras
            </Button>
          </Box>
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
          {/* Estadísticas del proveedor */}
          <Box sx={{ mb: 2 }}>
            {statsError && <Alert severity="error" sx={{ mb: 2 }}>{statsError}</Alert>}
            {statsLoading ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Total Vendido</Typography>
                    <Typography variant="h6">${Number(stats?.totalVendido ?? 0).toFixed(2)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Ganancia Neta (Tras comisiones)</Typography>
                    <Typography variant="h6">${Number(stats?.gananciaNeta ?? 0).toFixed(2)}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
          <List>
            {disenos.length === 0 ? <Typography>No has subido diseños.</Typography> : null}
            {disenos.map(diseno => (
              <ListItem key={diseno.id} divider
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="editar" sx={{ mr: 1 }} onClick={() => handleEditarDiseno(diseno.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="eliminar" color="error" onClick={() => solicitarEliminarDiseno(diseno.id)}>
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
      {/* Confirmación de eliminación de diseño */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar diseño"
        message="¿Eliminar este diseño? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminarDiseno}
        onCancel={() => { setConfirmOpen(false); setDisenoAEliminar(null); }}
      />

      {/* Modal para mostrar JSON del reporte */}
      <Modal open={reporteOpen} onClose={() => setReporteOpen(false)} aria-labelledby="reporte-json-modal">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 3, width: { xs: '90%', sm: 600 }, boxShadow: 24, borderRadius: 1 }}>
          <Typography id="reporte-json-modal" variant="h6" gutterBottom>Reporte de Compras</Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: '#111', color: '#0f0', p: 2, borderRadius: 1 }}>
            <pre style={{ margin: 0 }}>{reporteJson}</pre>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setReporteOpen(false)}>Cerrar</Button>
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

export default DashboardPage;