import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import ventaService from '../services/ventaService';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

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
    <Card className="p-4">
      <CardHeader className="pb-2">
        <CardTitle>Carrito de Compras</CardTitle>
      </CardHeader>

      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="text-slate-700">Tu carrito está vacío.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.nombre}</p>
                  <p className="text-sm text-slate-600">${item.precio.toFixed(2)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="my-2 h-px bg-slate-200" />

        <div className="text-right text-lg font-semibold">
          Total: ${total.toFixed(2)}
        </div>

        <Button
          className="mt-3 w-full"
          disabled={items.length === 0 || loading}
          onClick={handleCheckout}
        >
          {loading ? 'Procesando...' : 'Proceder al Pago'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CarritoPage;