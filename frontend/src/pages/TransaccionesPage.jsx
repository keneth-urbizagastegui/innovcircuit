import React, { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { formatCurrencyPEN } from '../utils/currency';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransaccionesPage = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    usuarioService
      .getMisTransacciones()
      .then((res) => setLineas(res.data))
      .catch(() => setError('Error al cargar las transacciones.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando...</span>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
        </CardHeader>

        {error && (
          <div className="mx-4 mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Diseño Vendido</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Precio Venta</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Comisión</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Tu Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {lineas.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-3 py-4 text-center text-slate-500">
                      No has generado transacciones.
                    </td>
                  </tr>
                )}
                {lineas.map((linea) => (
                  <tr key={linea.id} className="border-t">
                    <td className="px-3 py-2">
                      {linea.fechaVenta ? new Date(linea.fechaVenta).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 py-2">
                      {linea.disenoId ? (
                        <Link to={`/diseno/${linea.disenoId}`} className="underline hover:text-primary">
                          {linea.disenoNombre}
                        </Link>
                      ) : (
                        linea.disenoNombre || '-'
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrencyPEN(linea.precioAlComprar || 0)}</td>
                    <td className="px-3 py-2 text-right text-red-600">-{formatCurrencyPEN(linea.comisionPlataforma || 0)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-green-600">+{formatCurrencyPEN(linea.montoProveedor || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransaccionesPage;