import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import disenoService from '../services/disenoService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Typography, Box, CircularProgress, Alert, Button, Paper, Grid, Avatar, Divider } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DownloadIcon from '@mui/icons-material/Download';

const DisenoDetallePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const cart = useCart();
  const [diseno, setDiseno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDiseno = () => {
    setLoading(true);
    disenoService.getDisenoById(id)
      .then(response => setDiseno(response.data))
      .catch(() => setError('Error al cargar el diseño.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarDiseno();
  }, [id]);

  const handleLike = () => {
    disenoService.darLike(id)
      .then(() => cargarDiseno())
      .catch(() => setError("Error al procesar el 'like'"));
  };

  const handleDownload = () => {
    disenoService.descargar(id)
      .then(response => {
        const url = response?.data?.url;
        if (url) {
          window.open(url, '_blank');
        } else {
          setError('Este diseño no tiene archivo para descargar.');
        }
        cargarDiseno();
      })
      .catch(() => setError('Error al registrar la descarga.'));
  };

  const handleAddToCart = () => {
    if (diseno) cart.addItem(diseno);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!diseno) {
    return <Typography>Diseño no encontrado.</Typography>;
  }

  const proveedor = diseno.proveedor || { nombre: 'N/A', avatarUrl: '' };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Columna Izquierda (Imagen) */}
        <Grid item xs={12} md={7}>
          <Box
            component="img"
            sx={{ width: '100%', objectFit: 'cover', borderRadius: 2 }}
            alt={diseno.nombre}
            src={diseno.imagenUrl || 'https://via.placeholder.com/600x400.png?text=Sin+Imagen'}
          />
        </Grid>

        {/* Columna Derecha (Info) */}
        <Grid item xs={12} md={5}>
          <Typography variant="h3" gutterBottom>{diseno.nombre}</Typography>

          {/* Info del Proveedor */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={proveedor.avatarUrl || 'https://via.placeholder.com/150.png?text=User'} sx={{ mr: 1 }} />
            <Typography variant="h6">{proveedor.nombre}</Typography>
          </Box>

          {/* Estadísticas */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Button startIcon={<FavoriteIcon />} onClick={handleLike}>
              {diseno.likesCount} Likes
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={handleDownload}>
              {diseno.descargasCount} Descargas
            </Button>
          </Box>

          {/* Precio */}
          <Typography variant="h4" color="primary" sx={{ my: 2 }}>
            ${typeof diseno.precio === 'number' ? diseno.precio.toFixed(2) : diseno.precio}
          </Typography>

          {/* Botones de Acción (solo para Clientes) */}
          {user?.rol === 'CLIENTE' && (
            <Button variant="contained" size="large" onClick={handleAddToCart} fullWidth>
              Añadir al Carrito
            </Button>
          )}
        </Grid>

        {/* Descripción (Abajo) */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h5">Descripción</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" paragraph>
            {diseno.descripcion || 'Este diseño no tiene descripción.'}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DisenoDetallePage;