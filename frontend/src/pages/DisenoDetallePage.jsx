import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import disenoService from '../services/disenoService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Typography, Box, CircularProgress, Alert, Button, Paper, Grid, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, TextField, Modal, Chip } from '@mui/material';
import Rating from '@mui/material/Rating';
import resenaService from '../services/resenaService';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DownloadIcon from '@mui/icons-material/Download';
import { resolveImageUrl, resolveAvatarUrl, buildUiAvatar, FALLBACK_IMAGE, FALLBACK_AVATAR, onErrorSetSrc } from '../utils/imageUtils';
import iaService from '../services/iaService';

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
  // Responder reseñas (Proveedor)
  const [respuestaInputs, setRespuestaInputs] = useState({}); // { [resenaId]: string }
  const [responding, setResponding] = useState({}); // { [resenaId]: boolean }
  // Formulario nueva reseña (solo CLIENTE)
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // IA Chatbot modal state
  const [iaOpen, setIaOpen] = useState(false);
  const [iaMessages, setIaMessages] = useState([]); // { sender: 'user'|'ai', text }
  const [iaQuestion, setIaQuestion] = useState('');
  const [iaSending, setIaSending] = useState(false);
  const [iaError, setIaError] = useState('');

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

  const handleResponderResena = async (resenaId) => {
    const texto = (respuestaInputs[resenaId] || '').trim();
    if (!texto) return;
    setResponding(prev => ({ ...prev, [resenaId]: true }));
    try {
      await resenaService.responderResena(resenaId, { respuesta: texto });
      // Limpia input y recarga reseñas
      setRespuestaInputs(prev => ({ ...prev, [resenaId]: '' }));
      cargarResenas();
    } catch (err) {
      console.error('Error al responder reseña', err);
    } finally {
      setResponding(prev => ({ ...prev, [resenaId]: false }));
    }
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

  const handleOpenIa = () => {
    setIaOpen(true);
    setIaError('');
  };

  const handleCloseIa = () => {
    setIaOpen(false);
  };

  const handleIaSend = async () => {
    const pregunta = iaQuestion.trim();
    if (!pregunta) return;
    setIaSending(true);
    setIaError('');
    // Añade mensaje del usuario
    setIaMessages((prev) => [...prev, { sender: 'user', text: pregunta }]);
    try {
      const response = await iaService.chatbotDiseno(id, { pregunta });
      const texto = response?.data?.respuesta || 'Sin respuesta.';
      setIaMessages((prev) => [...prev, { sender: 'ai', text: texto }]);
      setIaQuestion('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al consultar el asistente de diseño.';
      setIaError(msg);
    } finally {
      setIaSending(false);
    }
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
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 40, { rounded: true });
  const popular = Number(diseno.descargasCount || 0) >= 25;
  const isGratis = Boolean(diseno.gratuito) || Number(diseno.precio || 0) === 0;

  return (
    <>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Columna Izquierda (Imagen) */}
        <Grid item xs={12} md={7}>
          <Box
            component="img"
            sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 2, backgroundColor: 'background.default' }}
            alt={diseno.nombre}
            src={mainImageSrc}
            loading="lazy"
            onError={onErrorSetSrc(FALLBACK_IMAGE)}
          />
        </Grid>

        {/* Columna Derecha (Info) */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h3" gutterBottom>{diseno.nombre}</Typography>
            {popular && <Chip label="Popular" color="warning" />}
          </Box>

          {/* Info del Proveedor */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={avatarSrc} onError={onErrorSetSrc(FALLBACK_AVATAR)} sx={{ width: 40, height: 40, mr: 1, border: '1px solid', borderColor: 'divider' }} />
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
          <Typography variant="h4" color={isGratis ? 'success.main' : 'primary'} sx={{ my: 2 }}>
            {isGratis ? 'Gratis' : `$${typeof diseno.precio === 'number' ? diseno.precio.toFixed(2) : diseno.precio}`}
          </Typography>

          {/* Botones de Acción (solo para Clientes) */}
          {user?.rol === 'CLIENTE' && (
            <Button variant="contained" size="large" onClick={handleAddToCart} fullWidth>
              Añadir al Carrito
            </Button>
          )}

          {/* Botón Asistente de Diseño (IA) - requiere autenticación */}
          {user && (
            <Button variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={handleOpenIa} fullWidth>
              Asistente de Diseño (IA)
            </Button>
          )}
        </Grid>

        {/* Especificaciones */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6">Especificaciones</Typography>
          <Divider sx={{ my: 1 }} />
          <List dense>
            {diseno?.nombreCategoria && (
              <ListItem>
                <ListItemText primary="Categoría" secondary={diseno.nombreCategoria} />
              </ListItem>
            )}
            {diseno?.estado && (
              <ListItem>
                <ListItemText primary="Estado" secondary={diseno.estado} />
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary="Tipo" secondary={isGratis ? 'Gratis' : 'De pago'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Likes" secondary={String(diseno.likesCount || 0)} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Descargas" secondary={String(diseno.descargasCount || 0)} />
            </ListItem>
          </List>
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
                        <Typography variant="subtitle1">{r?.nombreCliente || r?.clienteNombre || 'Cliente'}</Typography>
                        <Rating value={Number(r?.calificacion) || 0} readOnly size="small" />
                      </Box>
                    }
                    secondary={<Typography variant="body2">{r?.comentario || ''}</Typography>}
                  />
                  {/* Respuesta del proveedor existente */}
                  {r?.respuestaProveedor && (
                    <Box sx={{ mt: 1, ml: 7, p: 1.5, borderLeft: '3px solid', borderColor: 'primary.light', bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="subtitle2">Respuesta del proveedor:</Typography>
                      <Typography variant="body2">{r.respuestaProveedor}</Typography>
                    </Box>
                  )}
                  {/* Formulario de respuesta para el proveedor dueño del diseño */}
                  {user?.id === diseno?.proveedor?.id && !r?.respuestaProveedor && (
                    <Box sx={{ mt: 1, ml: 7, display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Escribe tu respuesta..."
                        value={respuestaInputs[r.id] || ''}
                        onChange={(e) => setRespuestaInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleResponderResena(r.id)}
                        disabled={responding[r.id]}
                      >
                        {responding[r.id] ? 'Enviando...' : 'Responder'}
                      </Button>
                    </Box>
                  )}
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
    {/* Modal: Asistente de Diseño (IA) */}
    <Modal open={iaOpen} onClose={handleCloseIa} aria-labelledby="ia-chatbot-modal">
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, maxWidth: '90%', bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 2 }}>
        <Typography id="ia-chatbot-modal" variant="h6" gutterBottom>
          Asistente de Diseño (IA)
        </Typography>
        {iaError && <Alert severity="error" sx={{ mb: 2 }}>{iaError}</Alert>}
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, height: 300, overflowY: 'auto', mb: 2, bgcolor: 'background.default' }}>
          {iaMessages.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Inicia la conversación con una pregunta técnica sobre este diseño.</Typography>
          ) : (
            iaMessages.map((m, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                <Box sx={{ maxWidth: '80%', p: 1.5, borderRadius: 2, bgcolor: m.sender === 'user' ? 'primary.light' : 'action.hover' }}>
                  <Typography variant="body2">{m.text}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField fullWidth placeholder="Escribe tu pregunta..." value={iaQuestion} onChange={(e) => setIaQuestion(e.target.value)} disabled={iaSending} />
          <Button variant="contained" onClick={handleIaSend} disabled={iaSending || !iaQuestion.trim()}>
            {iaSending ? 'Enviando...' : 'Enviar'}
          </Button>
        </Box>
      </Box>
    </Modal>
    </>
  );
};

export default DisenoDetallePage;