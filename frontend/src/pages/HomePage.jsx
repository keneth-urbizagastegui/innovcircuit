import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // Ya no lo necesitamos aquí
import disenoService from '../services/disenoService';
import DisenoCard from '../components/DisenoCard';
import { Grid, Typography, CircularProgress, Box, Alert } from '@mui/material';
// import { Link } from 'react-router-dom'; // Ya no se usa
import iaService from '../services/iaService';

const HomePage = () => {
  // const auth = useAuth(); // Ya no es necesario para esta lógica
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true); // Empezar cargando
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

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

  const handleSearch = () => {
    // búsqueda removida del home por requerimiento (se mantiene carga normal)
  };

  const handleIaSearch = () => {
    // opción IA deshabilitada temporalmente para simplificar el catálogo
  };

  // Sincronización con query removida al eliminar barra de búsqueda

  // Renderizado condicional (público, sin depender de auth)
  let content;
  if (loading) {
    content = <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  } else if (error) {
    content = <Alert severity="error">{error}</Alert>;
  } else if (disenos.length === 0) {
    content = <Typography>No hay diseños aprobados para mostrar.</Typography>;
  } else {
    const ordered = [...disenos].sort((a, b) => {
      const da = Number(a?.descargasCount || 0);
      const db = Number(b?.descargasCount || 0);
      if (db !== da) return db - da; // más descargados primero
      return String(a?.nombre || '').localeCompare(String(b?.nombre || ''));
    });
    content = (
      <Grid container spacing={3}>
        {ordered.map((diseno) => (
          <Grid item key={diseno.id} xs={12} sm={6} md={4} lg={3}>
            <DisenoCard diseno={diseno} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }} gutterBottom>
          Diseños electrónicos destacados
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Catálogo ordenado y visual consistente — estilo e‑commerce
        </Typography>
      </Box>
      {content}
    </Box>
  );
};

export default HomePage;