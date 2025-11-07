import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Typography, Box, Paper, List, ListItem, ListItemText, Button, CircularProgress, Alert, Grid, Modal } from '@mui/material';

const AdminDashboardPage = () => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [reporteOpen, setReporteOpen] = useState(false);
  const [reporteJson, setReporteJson] = useState('');

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

  const cargarEstadisticas = () => {
    setStatsLoading(true);
    setStatsError('');
    adminService.getEstadisticasAdmin()
      .then(res => {
        setStats(res.data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsError('Error al cargar estadísticas.');
        setStatsLoading(false);
      });
  };

  useEffect(() => {
    cargarPendientes();
    cargarEstadisticas();
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
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => {
          adminService.getReporteVentas()
            .then(res => { setReporteJson(JSON.stringify(res.data, null, 2)); setReporteOpen(true); })
            .catch(() => { setReporteJson('Error al generar reporte de ventas'); setReporteOpen(true); });
        }}>
          Generar Reporte de Ventas
        </Button>
      </Box>
      {/* Estadísticas globales */}
      {statsError && <Alert severity="error" sx={{ mb: 2 }}>{statsError}</Alert>}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Ventas Globales</Typography>
            {statsLoading ? (
              <CircularProgress size={20} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h6">${Number(stats?.totalVentasGlobal ?? 0).toFixed(2)}</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle1">Comisiones Generadas</Typography>
            {statsLoading ? (
              <CircularProgress size={20} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h6">${Number(stats?.totalComisiones ?? 0).toFixed(2)}</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
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
      {/* Modal para mostrar JSON del reporte */}
      <Modal open={reporteOpen} onClose={() => setReporteOpen(false)} aria-labelledby="reporte-ventas-json-modal">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 3, width: { xs: '90%', sm: 600 }, boxShadow: 24, borderRadius: 1 }}>
          <Typography id="reporte-ventas-json-modal" variant="h6" gutterBottom>Reporte de Ventas</Typography>
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

export default AdminDashboardPage;