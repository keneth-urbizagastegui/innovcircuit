import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // Ya no lo necesitamos aquí
import disenoService from '../services/disenoService';
import DisenoCard from '../components/DisenoCard';
import { Grid, Typography, CircularProgress, Box, Alert, Button } from '@mui/material';
import SearchBar from '../components/SearchBar';
import { useLocation } from 'react-router-dom';
// import { Link } from 'react-router-dom'; // Ya no se usa
import iaService from '../services/iaService';

const HomePage = () => {
  // const auth = useAuth(); // Ya no es necesario para esta lógica
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true); // Empezar cargando
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const location = useLocation();

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

  // Sincronizar búsqueda con parámetro ?q= de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    if (q && q !== keyword) {
      setKeyword(q);
      setLoading(true);
      setError('');
      disenoService
        .listarDisenosAprobados(q)
        .then((response) => setDisenos(response.data))
        .catch(() => setError('Error al buscar diseños.'))
        .finally(() => setLoading(false));
    }
  }, [location.search]);

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
      {/* Hero moderno */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }} gutterBottom>
          Descubre y comparte diseños electrónicos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Busca, explora y descarga proyectos listos para imprimir y prototipar
        </Typography>
        <Box sx={{ maxWidth: 720, mx: 'auto', display: 'flex', gap: 1 }}>
          <SearchBar
            size="large"
            placeholder="Buscar diseños (Arduino, Radio, Sensor...)"
            onSearch={(q) => {
              setKeyword(q);
              handleSearch();
            }}
          />
          <Button variant="outlined" color="secondary" onClick={handleIaSearch}>
            Búsqueda IA
          </Button>
        </Box>
      </Box>
      {content}
    </Box>
  );
};

export default HomePage;