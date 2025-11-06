import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import ventaService from '../services/ventaService';
import { Typography, Box, Button, Paper, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CarritoPage = () => {
  const { items, removeItem, clearCart } = useCart();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calcular el total
  const total = items.reduce((acc, item) => acc + (item.gratuito ? 0 : item.precio), 0);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const disenoIds = items.map((item) => item.id);
      const response = await ventaService.realizarCompra(disenoIds);

      setSuccess(`¡Compra realizada con éxito! ID de Venta: ${response.data.id}`);
      clearCart();
      setLoading(false);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data || 'Error al procesar la compra.');
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Carrito de Compras
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <List>
        {items.length === 0 ? (
          <Typography>Tu carrito está vacío.</Typography>
        ) : (
          items.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <Button edge="end" color="error" onClick={() => removeItem(item.id)}>
                  Quitar
                </Button>
              }
            >
              <ListItemText primary={item.nombre} secondary={`$${item.precio.toFixed(2)}`} />
            </ListItem>
          ))
        )}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" align="right">
        Total: ${total.toFixed(2)}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        sx={{ mt: 2 }}
        disabled={items.length === 0 || loading}
        onClick={handleCheckout}
      >
        {loading ? 'Procesando...' : 'Proceder al Pago'}
      </Button>
    </Paper>
  );
};

export default CarritoPage;