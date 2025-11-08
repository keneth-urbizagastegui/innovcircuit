import React, { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { resolveImageUrl, FALLBACK_CARD_IMAGE, onErrorSetSrc } from '../utils/imageUtils';
import { Loader2 } from 'lucide-react';

const MisPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    usuarioService
      .getMisPedidos()
      .then((res) => setPedidos(res.data))
      .catch(() => setError('Error al cargar los pedidos de impresión.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center mt-8">
      <Loader2 className="h-6 w-6 animate-spin text-slate-700" aria-label="Cargando" />
    </div>
  );

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <CardTitle>Mis Pedidos de Impresión</CardTitle>
      </CardHeader>
      {error && (
        <div className="mx-6 mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <CardContent className="p-0">
        {pedidos.length === 0 ? (
          <p className="px-6 py-4 text-slate-700">No has solicitado impresiones.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {pedidos.map((pedido) => (
              <li key={pedido.id} className="flex items-center gap-4 py-3 px-6">
                <img
                  src={resolveImageUrl(pedido.imagenUrlDiseno) || FALLBACK_CARD_IMAGE}
                  onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
                  alt={pedido.disenoNombre}
                  className="h-16 w-16 rounded-md object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{pedido.disenoNombre}</p>
                  <p className="text-sm text-slate-600">
                    Solicitado: {new Date(pedido.fechaSolicitud).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    Dirección: {pedido.direccionEnvio}
                  </p>
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  {pedido.estado}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MisPedidosPage;