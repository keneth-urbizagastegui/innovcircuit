import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatCurrencyPEN } from '../utils/currency';
import { Loader2 } from 'lucide-react';

const AdminRetirosPage = () => {
  const [retiros, setRetiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarRetiros = () => {
    setLoading(true);
    setError('');
    // Por defecto, cargar las pendientes
    adminService
      .getRetiros('PENDIENTE')
      .then((res) => setRetiros(res.data))
      .catch(() => setError('Error al cargar solicitudes de retiro.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarRetiros();
  }, []);

  const handleProcesar = (id, estado) => {
    adminService
      .procesarRetiro(id, estado)
      .then(() => {
        // Recargar la lista de pendientes
        cargarRetiros();
      })
      .catch(() => setError(`Error al procesar la solicitud ${id}.`));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando solicitudes de retiro...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Solicitudes de Retiro (Pendientes)</CardTitle>
      </CardHeader>
      {error && (
        <div className="mx-4 mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha Sol.</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Método de Pago</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Monto</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {retiros.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-slate-500">
                    No hay solicitudes pendientes.
                  </td>
                </tr>
              )}
              {retiros.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{new Date(r.fechaSolicitud).toLocaleDateString()}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{r.metodoPago}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrencyPEN(r.monto)}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <Button variant="success" size="sm" onClick={() => handleProcesar(r.id, 'APROBADO')}>
                      Aprobar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleProcesar(r.id, 'RECHAZADO')}>
                      Rechazar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRetirosPage;