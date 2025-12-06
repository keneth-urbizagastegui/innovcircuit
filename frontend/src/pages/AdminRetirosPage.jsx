import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatCurrencyPEN } from '../utils/currency';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminRetirosPage = () => {
  const [retiros, setRetiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [retiroSeleccionado, setRetiroSeleccionado] = useState(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState(''); // 'APROBADO' or 'RECHAZADO'

  const cargarRetiros = () => {
    setLoading(true);
    setError('');
    // Load all retiros (not just PENDIENTE) to show complete history
    adminService
      .getRetiros() // No filter, or you can add a filter dropdown
      .then((res) => setRetiros(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Error al cargar solicitudes de retiro.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarRetiros();
  }, []);

  const solicitarProcesar = (retiro, estado) => {
    setRetiroSeleccionado(retiro);
    setAccionSeleccionada(estado);
    setConfirmOpen(true);
  };

  const confirmarProcesar = () => {
    if (!retiroSeleccionado || !accionSeleccionada) return;

    setProcessingId(retiroSeleccionado.id);
    adminService
      .procesarRetiro(retiroSeleccionado.id, accionSeleccionada)
      .then(() => {
        toast.success(`Retiro ${accionSeleccionada === 'APROBADO' ? 'aprobado' : 'rechazado'} correctamente`);
        cargarRetiros();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || `Error al procesar la solicitud ${retiroSeleccionado.id}`;
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setProcessingId(null);
        setConfirmOpen(false);
        setRetiroSeleccionado(null);
        setAccionSeleccionada('');
      });
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando solicitudes de retiro...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state with retry
  if (error && retiros.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6 border-red-200">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-700 font-medium">No se pudieron cargar las solicitudes de retiro</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={cargarRetiros} className="border-red-200 text-red-700 hover:bg-red-100">
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Solicitudes de Retiro</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Aprueba o rechaza solicitudes de retiro de fondos de proveedores
          </p>
        </CardHeader>

        {/* Error banner (if error but we have retiros loaded) */}
        {error && retiros.length > 0 && (
          <div className="mx-6 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="link" size="sm" onClick={cargarRetiros} className="text-red-700">
              Reintentar
            </Button>
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto hide-scrollbar border-t">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Proveedor</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha Solicitud</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Método de Pago</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Monto</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Estado</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {retiros.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-muted-foreground">
                      No hay solicitudes de retiro.
                    </td>
                  </tr>
                ) : (
                  retiros.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-slate-50">
                      <td className="px-3 py-2">{r.id}</td>
                      <td className="px-3 py-2 font-medium">
                        {r.proveedor?.nombre || r.usuarioId || 'N/A'}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(r.fechaSolicitud).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate" title={r.metodoPago}>
                        {r.metodoPago}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatCurrencyPEN(r.monto)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${r.estado === 'APROBADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.estado === 'RECHAZADO'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {r.estado === 'PENDIENTE' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => solicitarProcesar(r, 'APROBADO')}
                              disabled={processingId === r.id}
                            >
                              {processingId === r.id && accionSeleccionada === 'APROBADO' ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Aprobando...
                                </>
                              ) : (
                                'Aprobar'
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => solicitarProcesar(r, 'RECHAZADO')}
                              disabled={processingId === r.id}
                            >
                              {processingId === r.id && accionSeleccionada === 'RECHAZADO' ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Rechazando...
                                </>
                              ) : (
                                'Rechazar'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {r.estado === 'APROBADO' ? 'Procesado' : 'Denegado'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={accionSeleccionada === 'APROBADO' ? 'Aprobar Retiro' : 'Rechazar Retiro'}
        message={
          retiroSeleccionado
            ? accionSeleccionada === 'APROBADO'
              ? `¿Aprobar retiro de ${formatCurrencyPEN(retiroSeleccionado.monto)} para ${retiroSeleccionado.proveedor?.nombre || 'el proveedor'}?`
              : `¿Rechazar retiro de ${formatCurrencyPEN(retiroSeleccionado.monto)} para ${retiroSeleccionado.proveedor?.nombre || 'el proveedor'}?`
            : ''
        }
        confirmText={processingId ? (accionSeleccionada === 'APROBADO' ? 'Aprobando...' : 'Rechazando...') : (accionSeleccionada === 'APROBADO' ? 'Aprobar' : 'Rechazar')}
        cancelText="Cancelar"
        onConfirm={confirmarProcesar}
        onCancel={() => {
          setConfirmOpen(false);
          setRetiroSeleccionado(null);
          setAccionSeleccionada('');
        }}
      />
    </div>
  );
};

export default AdminRetirosPage;