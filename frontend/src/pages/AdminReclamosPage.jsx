import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrencyPEN } from '../utils/currency';

const AdminReclamosPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
  const [aceptarReembolso, setAceptarReembolso] = useState(false);

  const cargar = () => {
    setLoading(true);
    setError('');
    adminService.getReclamos()
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Error al cargar reclamos.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const solicitarResolucion = (reclamo, aceptar) => {
    setReclamoSeleccionado(reclamo);
    setAceptarReembolso(aceptar);
    setConfirmOpen(true);
  };

  const confirmarResolucion = () => {
    if (!reclamoSeleccionado) return;

    setResolvingId(reclamoSeleccionado.id);
    adminService.resolverReclamo(reclamoSeleccionado.id, aceptarReembolso)
      .then(() => {
        if (aceptarReembolso) {
          toast.success('Reclamo aceptado. Se procesará el reembolso.');
        } else {
          toast.success('Reclamo rechazado correctamente.');
        }
        cargar();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo resolver el reclamo.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setResolvingId(null);
        setConfirmOpen(false);
        setReclamoSeleccionado(null);
        setAceptarReembolso(false);
      });
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando reclamos...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state with retry
  if (error && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6 border-red-200">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-700 font-medium">No se pudieron cargar los reclamos</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={cargar} className="border-red-200 text-red-700 hover:bg-red-100">
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
          <CardTitle>Reclamos de Clientes</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Revisa y resuelve reclamos de compras de diseños
          </p>
        </CardHeader>

        {/* Error banner (if error but we have items loaded) */}
        {error && items.length > 0 && (
          <div className="mx-6 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="link" size="sm" onClick={cargar} className="text-red-700">
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
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha Reclamo</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Diseño</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Proveedor</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Monto</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Motivo</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-muted-foreground">
                      No hay reclamos activos.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => {
                    const isProcessing = resolvingId === r.id;

                    return (
                      <tr key={r.id} className="border-t hover:bg-slate-50">
                        <td className="px-3 py-2">{r.id}</td>
                        <td className="px-3 py-2">
                          {r.fechaReclamo ? new Date(r.fechaReclamo).toLocaleDateString('es-PE') :
                            r.fechaVenta ? new Date(r.fechaVenta).toLocaleDateString('es-PE') : '-'}
                        </td>
                        <td className="px-3 py-2 font-medium">{r.clienteNombre || 'N/A'}</td>
                        <td className="px-3 py-2">{r.disenoNombre || 'N/A'}</td>
                        <td className="px-3 py-2">{r.proveedorNombre || 'N/A'}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrencyPEN(Number(r.montoProveedor || 0))}
                        </td>
                        <td className="px-3 py-2 max-w-xs" title={r.motivoReclamo}>
                          <div className="truncate">{r.motivoReclamo || '-'}</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => solicitarResolucion(r, true)}
                            >
                              {isProcessing && aceptarReembolso ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Procesando...
                                </>
                              ) : (
                                'Aceptar Reembolso'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => solicitarResolucion(r, false)}
                            >
                              {isProcessing && !aceptarReembolso ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Procesando...
                                </>
                              ) : (
                                'Rechazar'
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={aceptarReembolso ? 'Aceptar Reclamo y Reembolsar' : 'Rechazar Reclamo'}
        message={
          reclamoSeleccionado
            ? aceptarReembolso
              ? `¿Aceptar el reclamo del cliente ${reclamoSeleccionado.clienteNombre} y procesar reembolso de ${formatCurrencyPEN(Number(reclamoSeleccionado.montoProveedor || 0))}? Esta acción marcará la compra como REEMBOLSADO.`
              : `¿Rechazar el reclamo del cliente ${reclamoSeleccionado.clienteNombre}? El reclamo será marcado como resuelto sin reembolso.`
            : ''
        }
        confirmText={resolvingId ? 'Procesando...' : (aceptarReembolso ? 'Aceptar y Reembolsar' : 'Rechazar')}
        cancelText="Cancelar"
        onConfirm={confirmarResolucion}
        onCancel={() => {
          setConfirmOpen(false);
          setReclamoSeleccionado(null);
          setAceptarReembolso(false);
        }}
      />
    </div>
  );
};

export default AdminReclamosPage;
