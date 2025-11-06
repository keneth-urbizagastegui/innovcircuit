import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Box, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Icono de Likes
import DownloadIcon from '@mui/icons-material/Download'; // Icono de Descargas

const DisenoCard = ({ diseno }) => {
  // Fallback por si la API aún no envía el objeto proveedor
  const proveedor = diseno.proveedor || { nombre: 'N/A', avatarUrl: '' };
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Proveedor Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
        <Avatar
          src={proveedor.avatarUrl || 'https://via.placeholder.com/150.png?text=User'}
          sx={{ width: 24, height: 24, mr: 1 }}
        />
        <Typography variant="body2">{proveedor.nombre}</Typography>
      </Box>
      {/* Link en la Imagen */}
      <Box component={Link} to={`/diseno/${diseno.id}`} sx={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="160"
          image={diseno.imagenUrl || 'https://via.placeholder.com/300x200.png?text=Sin+Imagen'}
          alt={diseno.nombre}
        />
        {/* Titulo */}
        <CardContent sx={{ flexGrow: 1, py: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontSize: '1rem', color: 'text.primary' }}>
            {diseno.nombre}
          </Typography>
        </CardContent>
      </Box>
      {/* Estadísticas y Precio */}
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2, mt: 'auto' }}>
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
        
        <Typography variant="h6" color="primary">
          ${diseno.precio.toFixed(2)}
        </Typography>
      </CardActions>
    </Card>
  );
};

export default DisenoCard;