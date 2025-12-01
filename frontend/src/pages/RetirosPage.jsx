import React, { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';
import retiroService from '../services/retiroService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { formatCurrencyPEN } from '../utils/currency';
import { Loader2 } from 'lucide-react';

const RetirosPage = () => {
  const [stats, setStats] = useState(null);
  const [retiros, setRetiros] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRetiros, setLoadingRetiros] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cargarDatos = () => {
    setLoadingStats(true);
    setLoadingRetiros(true);
    setError('');

    usuarioService.getMiDashboard()
      .then((res) => setStats(res.data))
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => setLoadingStats(false));

    usuarioService.getMisRetiros()
      .then((res) => setRetiros(res.data))
      .catch(() => setError('Error al cargar historial de retiros'))
      .finally(() => setLoadingRetiros(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const montoNum = parseFloat(monto);
      if (isNaN(montoNum) || montoNum <= 0) {
        throw new Error('El monto debe ser un número positivo.');
      }
      await retiroService.solicitarRetiro({ monto: montoNum, metodoPago });
      setMonto('');
      setMetodoPago('');
      cargarDatos(); // Recargar todo
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Error al solicitar el retiro.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Columna Izquierda: Formulario de Retiro */}
        <div>
          <Card className="p-4">
            <CardHeader className="pb-2">
              <CardTitle>Solicitar Retiro</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {error && (
                <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Monto (PEN)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="Ej: 150.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Método de Pago</label>
                  <Textarea
                    rows={3}
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    placeholder="Ej: BCP - CCI: 123-456-7890123..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting || loadingStats}>
                  {submitting ? 'Solicitando...' : 'Solicitar Retiro'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Historial */}
        <div className="md:col-span-2">
          <Card className="p-4">
            <CardHeader className="pb-2">
              <CardTitle>Historial de Retiros</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha Solicitud</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Método</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Monto</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRetiros ? (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : retiros.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center p-4 text-muted-foreground">
                          No hay solicitudes de retiro.
                        </td>
                      </tr>
                    ) : (
                      retiros.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="px-3 py-2">{new Date(r.fechaSolicitud).toLocaleDateString()}</td>
                          <td className="px-3 py-2 max-w-lg break-words">{r.metodoPago}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrencyPEN(r.monto)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{r.estado}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetirosPage;