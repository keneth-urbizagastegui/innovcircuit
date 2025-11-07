import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Box, Avatar, Chip, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Icono de Likes
import DownloadIcon from '@mui/icons-material/Download'; // Icono de Descargas
import { resolveImageUrl, resolveAvatarUrl, FALLBACK_CARD_IMAGE, FALLBACK_AVATAR, onErrorSetSrc } from '../utils/imageUtils';

const DisenoCard = ({ diseno }) => {
  // Fallback por si la API aún no envía el objeto proveedor
  const proveedor = diseno.proveedor || { nombre: 'N/A', avatarUrl: '' };
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 32, { rounded: true });
  const imageSrc = resolveImageUrl(diseno.imagenUrl) || FALLBACK_CARD_IMAGE;
  const isGratis = Boolean(diseno.gratuito) || Number(diseno.precio || 0) === 0;
  const popular = Number(diseno.descargasCount || 0) >= 25; // umbral simple
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
      {/* Proveedor Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.25 }}>
        <Avatar src={avatarSrc} onError={onErrorSetSrc(FALLBACK_AVATAR)} sx={{ width: 28, height: 28, mr: 1, border: '1px solid', borderColor: 'divider' }} />
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{proveedor.nombre}</Typography>
        {popular && <Chip size="small" label="Popular" color="warning" sx={{ ml: 1 }} />}
      </Box>
      {/* Link en la Imagen */}
      <Box component={Link} to={`/diseno/${diseno.id}`} sx={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="220"
          image={imageSrc}
          onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
          loading="lazy"
          sx={{ objectFit: 'cover', backgroundColor: 'background.default' }}
          alt={diseno.nombre}
        />
        {/* Titulo */}
        <CardContent sx={{ flexGrow: 1, py: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontSize: '1rem', color: 'text.primary', lineHeight: 1.3 }}>
            {diseno.nombre}
          </Typography>
          {diseno?.nombreCategoria && (
            <Typography variant="caption" color="text.secondary">
              {diseno.nombreCategoria}
            </Typography>
          )}
        </CardContent>
      </Box>
      {/* Estadísticas y Precio */}
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FavoriteBorderIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">{diseno.likesCount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DownloadIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">{diseno.descargasCount}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color={isGratis ? 'success.main' : 'primary'} sx={{ mr: 1 }}>
            {isGratis ? 'Gratis' : `$${Number(diseno.precio || 0).toFixed(2)}`}
          </Typography>
          <Button component={Link} to={`/diseno/${diseno.id}`} size="small" variant="outlined">
            Ver más
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default DisenoCard;