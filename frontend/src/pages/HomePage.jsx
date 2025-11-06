import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // Ya no lo necesitamos aquí
import disenoService from '../services/disenoService';
import DisenoCard from '../components/DisenoCard';
import { Grid, Typography, CircularProgress, Box, Alert } from '@mui/material';
// import { Link } from 'react-router-dom'; // Ya no se usa

const HomePage = () => {
  // const auth = useAuth(); // Ya no es necesario para esta lógica
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true); // Empezar cargando
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar diseños al montar el componente, para todos.
    setLoading(true);
    disenoService
      .listarDisenosAprobados()
      .then((response) => {
        setDisenos(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los diseños. La API puede estar caída.');
        setLoading(false);
      });
  }, []);

  // Renderizado condicional (público, sin depender de auth)
  let content;
  if (loading) {
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