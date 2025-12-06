import React, { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { formatCurrencyPEN } from '../utils/currency';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const TransaccionesPage = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarTransacciones = () => {
    setLoading(true);
    setError('');
    usuarioService
      .getMisTransacciones()
      .then((res) => setLineas(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Error al cargar las transacciones.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarTransacciones();
  }, []);

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Cargando tus ventas...</span>
          </CardContent>
        </Card>
      </div>
    );

  if (error) return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <p className="text-red-700 font-medium">{error}</p>
          <Button variant="outline" onClick={cargarTransacciones} className="border-red-200 text-red-700 hover:bg-red-100">
            Reintentar
          </Button>
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

        <CardContent className="p-0">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha de la venta</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Nombre del diseño</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Precio de venta</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Comisión</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Monto neto</th>
                </tr>
              </thead>
              <tbody>
                {lineas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <p className="text-slate-500 mb-4">Aún no tienes transacciones.</p>
                      <Button as={Link} to="/subir-diseno" variant="outline">
                        Sigue subiendo diseños
                      </Button>
                    </td>
                  </tr>
                ) : (
                  lineas.map((linea) => (
                    <tr key={linea.id} className="border-t">
                      <td className="px-3 py-2">
                        {linea.fechaVenta ? new Date(linea.fechaVenta).toLocaleDateString('es-PE') : '-'}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransaccionesPage;