import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // Ya no lo necesitamos aquí
import disenoService from '../services/disenoService';
import DisenoCard from '../components/DisenoCard';
import { Grid, Typography, CircularProgress, Box, Alert, TextField, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
    setLoading(true);
    setError('');
    disenoService
      .listarDisenosAprobados(keyword && keyword.trim() ? keyword.trim() : undefined)
      .then((response) => {
        setDisenos(response.data);
      })
      .catch(() => {
        setError('Error al buscar diseños.');
      })
      .finally(() => setLoading(false));
  };

  const handleIaSearch = () => {
    setLoading(true);
    setError('');
    const prompt = (keyword || '').trim();
    iaService
      .buscarAsistido({ prompt })
      .then((response) => {
        const data = Array.isArray(response?.data) ? response.data : [];
        setDisenos(data);
      })
      .catch(() => {
        setError('Error en la búsqueda asistida por IA.');
      })
      .finally(() => setLoading(false));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      {/* Barra de búsqueda */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar diseños (ej. Arduino, Radio, Sensor)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton color="primary" onClick={handleSearch} aria-label="Buscar">
          <SearchIcon />
        </IconButton>
        <Button variant="outlined" color="secondary" onClick={handleIaSearch}>
          Búsqueda IA
        </Button>
      </Box>
      {content}
    </Box>
  );
};

export default HomePage;