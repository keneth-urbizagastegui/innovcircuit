import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { resolveImageUrl, FALLBACK_CARD_IMAGE, onErrorSetSrc } from '../utils/imageUtils';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

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
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudieron cargar tus pedidos. Intenta nuevamente.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-12 gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-teal-600" aria-label="Cargando" />
      <p className="text-slate-500 font-medium">Cargando tus pedidos...</p>
    </div>
  );

  // Helper para badges de estado
  const getEstadoBadge = (estado) => {
    const styles = {
      PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-200",
      EN_PROCESO: "bg-blue-100 text-blue-700 border-blue-200",
      ENVIADO: "bg-green-100 text-green-700 border-green-200",
      ENTREGADO: "bg-green-100 text-green-700 border-green-200",
      CANCELADO: "bg-red-100 text-red-700 border-red-200",
    };
    const className = styles[estado] || "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-semibold border", className)}>
        {estado.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Card className="bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-xl text-slate-800">Mis Pedidos de Impresión</CardTitle>
      </CardHeader>
      
      {error && (
        <div className="mx-6 mt-4 mb-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center font-medium shadow-sm">
          <span className="mr-2 text-lg">⚠️</span> {error}
        </div>
      )}

      <CardContent className="p-0">
        {pedidos.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-600 mb-6 text-lg">Aún no has solicitado impresiones.</p>
            <Button as={Link} to="/dashboard" className="bg-teal-600 hover:bg-teal-700 text-white">
              Ir a mis compras
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pedidos.map((pedido) => (
              <li key={pedido.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 px-6 hover:bg-slate-50 transition-colors" aria-label={`Pedido de ${pedido.disenoNombre}`}>
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg border border-slate-200 overflow-hidden bg-white">
                  <img
                    src={resolveImageUrl(pedido.imagenUrlDiseno) || FALLBACK_CARD_IMAGE}
                    onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
                    alt={pedido.disenoNombre}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate text-lg">{pedido.disenoNombre}</h3>
                    {getEstadoBadge(pedido.estado)}
                  </div>
                  
                  <div className="text-sm text-slate-500 space-y-1">
                    <p>📅 Solicitado: <span className="font-medium text-slate-700">{new Date(pedido.fechaSolicitud).toLocaleDateString()}</span></p>
                    <p className="truncate">📍 Dirección: <span className="text-slate-700" title={pedido.direccionEnvio}>{pedido.direccionEnvio}</span></p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      </Card>
    </div>
  );
};

export default MisPedidosPage;