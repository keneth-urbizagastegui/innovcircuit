import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import disenoService from '../services/disenoService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Typography, Box, CircularProgress, Alert, Button, Paper, Grid, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, TextField } from '@mui/material';
import Rating from '@mui/material/Rating';
import resenaService from '../services/resenaService';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DownloadIcon from '@mui/icons-material/Download';
import { resolveImageUrl, resolveAvatarUrl, buildUiAvatar, FALLBACK_IMAGE, FALLBACK_AVATAR, onErrorSetSrc } from '../utils/imageUtils';

const DisenoDetallePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const cart = useCart();
  const [diseno, setDiseno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Reseñas
  const [resenas, setResenas] = useState([]);
  const [resenasLoading, setResenasLoading] = useState(true);
  const [resenasError, setResenasError] = useState('');
  // Formulario nueva reseña (solo CLIENTE)
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cargarDiseno = () => {
    setLoading(true);
    disenoService.getDisenoById(id)
      .then(response => setDiseno(response.data))
      .catch(() => setError('Error al cargar el diseño.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarDiseno();
    cargarResenas();
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

  const cargarResenas = () => {
    setResenasLoading(true);
    setResenasError('');
    resenaService.getResenasPorDiseno(id)
      .then(response => {
        setResenas(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setResenasError('Error al cargar las reseñas.'))
      .finally(() => setResenasLoading(false));
  };

  const handleCrearResena = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = { disenoId: Number(id), calificacion, comentario };
    resenaService.crearResena(payload)
      .then(() => {
        setComentario('');
        setCalificacion(0);
        cargarResenas();
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Error al crear la reseña.';
        setError(msg);
      })
      .finally(() => setSubmitting(false));
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
  const mainImageSrc = resolveImageUrl(diseno.imagenUrl) || FALLBACK_IMAGE;
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 64, { rounded: true });

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Columna Izquierda (Imagen) */}
        <Grid item xs={12} md={7}>
          <Box
            component="img"
            sx={{ width: '100%', objectFit: 'cover', borderRadius: 2 }}
            alt={diseno.nombre}
            src={mainImageSrc}
            onError={onErrorSetSrc(FALLBACK_IMAGE)}
          />
        </Grid>

        {/* Columna Derecha (Info) */}
        <Grid item xs={12} md={5}>
          <Typography variant="h3" gutterBottom>{diseno.nombre}</Typography>

          {/* Info del Proveedor */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={avatarSrc} onError={onErrorSetSrc(FALLBACK_AVATAR)} sx={{ mr: 1 }} />
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

        {/* Reseñas */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Typography variant="h5">Reseñas</Typography>
          <Divider sx={{ my: 1 }} />

          {resenasLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : resenasError ? (
            <Alert severity="error">{resenasError}</Alert>
          ) : resenas.length === 0 ? (
            <Typography variant="body2">Aún no hay reseñas para este diseño.</Typography>
          ) : (
            <List>
              {resenas.map((r) => (
                <ListItem key={r.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar src={buildUiAvatar(r?.clienteNombre || 'Usuario', 32, { rounded: true })} alt={r?.clienteNombre || 'Usuario'} onError={onErrorSetSrc(FALLBACK_AVATAR)} />
            </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{r?.clienteNombre || 'Cliente'}</Typography>
                        <Rating value={Number(r?.calificacion) || 0} readOnly size="small" />
                      </Box>
                    }
                    secondary={<Typography variant="body2">{r?.comentario || ''}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Grid>

        {/* Formulario de Nueva Reseña - Solo CLIENTE */}
        {user?.rol === 'CLIENTE' && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6">Escribir una Reseña</Typography>
            <Divider sx={{ my: 1 }} />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleCrearResena} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Calificación:</Typography>
                <Rating value={calificacion} onChange={(_, v) => setCalificacion(v || 0)} />
              </Box>
              <TextField
                label="Comentario"
                multiline
                minRows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
              <Button type="submit" variant="contained" disabled={submitting || calificacion === 0}>
                {submitting ? 'Enviando...' : 'Enviar Reseña'}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default DisenoDetallePage;