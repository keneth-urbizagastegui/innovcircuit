import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, TextField, Button, CircularProgress, Alert, Grid } from '@mui/material';
import adminService from '../services/adminService';

const AdminConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarConfigs = () => {
    setLoading(true);
    setError('');
    adminService.getConfiguraciones()
      .then(res => {
        const list = res.data || [];
        setConfigs(list);
        const map = {};
        list.forEach(c => { map[c.clave] = c.valor; });
        setValues(map);
      })
      .catch(() => setError('Error al cargar configuraciones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarConfigs();
  }, []);

  const handleChange = (clave, nuevoValor) => {
    setValues(prev => ({ ...prev, [clave]: nuevoValor }));
    setSuccess('');
    setError('');
  };

  const handleGuardar = (clave) => {
    const valor = values[clave];
    setSavingKey(clave);
    setError('');
    setSuccess('');
    adminService.actualizarConfiguracion(clave, valor)
      .then(() => {
        setSuccess(`Configuración '${clave}' actualizada correctamente.`);
        setSavingKey('');
        cargarConfigs();
      })
      .catch(() => {
        setError(`No se pudo actualizar la configuración '${clave}'.`);
        setSavingKey('');
      });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Configuración (Admin)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {configs.length === 0 ? (
        <Typography>No hay configuraciones registradas.</Typography>
      ) : (
        <Grid container spacing={2}>
          {configs.map(conf => (
            <Grid item xs={12} md={6} key={conf.id || conf.clave}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>{conf.clave}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Valor"
                    value={values[conf.clave] ?? ''}
                    onChange={(e) => handleChange(conf.clave, e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleGuardar(conf.clave)}
                    disabled={savingKey === conf.clave}
                  >
                    {savingKey === conf.clave ? 'Guardando...' : 'Guardar'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default AdminConfigPage;