import React, { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';
import retiroService from '../services/retiroService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { formatCurrencyPEN } from '../utils/currency';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      .catch(() => toast.error('Error al cargar estadísticas'))
      .finally(() => setLoadingStats(false));

    usuarioService.getMisRetiros()
      .then((res) => setRetiros(res.data))
      .catch((err) => {
        setError('Error al cargar historial de retiros');
        toast.error('Error al cargar historial de retiros');
      })
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
      // Validación de monto mínimo
      if (montoNum < 10) {
        throw new Error(`El monto mínimo de retiro es ${formatCurrencyPEN(10)}.`);
      }

      const saldoDisponible = stats?.gananciaNeta || 0;
      if (montoNum > saldoDisponible) {
        throw new Error(`El monto supera tu saldo disponible (${formatCurrencyPEN(saldoDisponible)}).`);
      }

      await retiroService.solicitarRetiro({ monto: montoNum, metodoPago });
      toast.success('Solicitud de retiro creada correctamente');
      setMonto('');
      setMetodoPago('');
      cargarDatos(); // Recargar todo
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Error al solicitar el retiro.';
      setError(msg);
      toast.error(msg);
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
                  <p className="text-xs text-muted-foreground mt-1">Mínimo: {formatCurrencyPEN(10)}</p>
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
                          <td className="px-3 py-2 text-right font-semibold">
                            <span className={`px-2 py-1 rounded-full text-xs border ${r.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                r.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700 border-red-200' :
                                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                              {r.estado}
                            </span>
                          </td>
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