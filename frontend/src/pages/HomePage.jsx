import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import disenoService from '../services/disenoService';
import DisenoCard from '../components/DisenoCard';
import { Grid, Typography, CircularProgress, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const auth = useAuth();
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.isAuthenticated()) {
      setLoading(true);
      disenoService
        .listarDisenosAprobados()
        .then((response) => {
          setDisenos(response.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Error al cargar los diseños. Token inválido o API caída.');
          setLoading(false);
        });
    }
  }, [auth.isAuthenticated()]);

  // Renderizado condicional
  let content;
  if (!auth.isAuthenticated()) {
    content = <Typography>Por favor, <Link to="/login">inicia sesión</Link> para ver el catálogo.</Typography>;
  } else if (loading) {
    content = <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  } else if (error) {
    content = <Alert severity="error">{error}</Alert>;
  } else if (disenos.length === 0) {
    content = <Typography>No hay diseños aprobados para mostrar.</Typography>;
  } else {
    content = (
      <Grid container spacing={4}>
        {disenos.map((diseno) => (
          <Grid item key={diseno.id} xs={12} sm={6} md={4}>
            <DisenoCard diseno={diseno} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Catálogo de Diseños Aprobados</Typography>
      {content}
    </Box>
  );
};

export default HomePage;