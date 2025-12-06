import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ventaService from '../services/ventaService';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { formatCurrencyPEN } from '../utils/currency';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const CarritoPage = () => {
  const { items, removeItem, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calcular el total: los diseños gratuitos (gratuito === true) suman 0
  const total = items.reduce((acc, item) => acc + (item.gratuito ? 0 : item.precio), 0);

  const handleCheckout = async () => {
    // Verificar que el usuario esté autenticado Y sea CLIENTE
    if (!isAuthenticated() || !user || user.rol !== 'CLIENTE') {
      setError('Inicia sesión o regístrate como cliente para completar tu compra.');
      toast.error("Debes iniciar sesión como cliente para comprar");
      navigate('/login?next=/carrito');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const disenoIds = items.map((item) => item.id);
      const response = await ventaService.realizarCompra(disenoIds);

      const msg = `¡Compra realizada con éxito! ID de Venta: ${response.data.id}`;
      setSuccess(msg);
      toast.success("Compra realizada con éxito");

      clearCart();
      setLoading(false);

      // Redirigir al Dashboard de Cliente para ver la biblioteca de compras
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Ocurrió un error al procesar tu compra";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
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
            <div className="text-center py-8">
              <p className="text-slate-700 mb-4 text-lg">Tu carrito está vacío.</p>
              <Button as={Link} to="/" variant="outline">
                Explorar diseños
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.nombre}</p>
                    <p className="text-sm text-slate-600">
                      {item.gratuito ? (
                        <span className="text-green-600 font-medium">Gratis</span>
                      ) : (
                        formatCurrencyPEN(item.precio)
                      )}
                    </p>
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
            Total: {formatCurrencyPEN(total)}
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
    </div>
  );
};

export default CarritoPage;