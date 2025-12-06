import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  // Valid state transitions
  const ESTADOS = {
    PENDIENTE_IMPRESION: 'PENDIENTE_IMPRESION',
    EN_PRODUCCION: 'EN_PRODUCCION',
    ENVIADO: 'ENVIADO',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO'
  };

  const cargarPedidos = () => {
    setLoading(true);
    setError('');
    // Load all pedidos to show complete status
    adminService
      .getPedidos() // No filter
      .then((res) => setPedidos(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Error al cargar pedidos.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const solicitarCambioEstado = (pedido, estado) => {
    setPedidoSeleccionado(pedido);
    setNuevoEstado(estado);
    setConfirmOpen(true);
  };

  const confirmarCambioEstado = () => {
    if (!pedidoSeleccionado || !nuevoEstado) return;

    setUpdatingId(pedidoSeleccionado.id);
    adminService
      .actualizarEstadoPedido(pedidoSeleccionado.id, nuevoEstado)
      .then(() => {
        toast.success(`Pedido actualizado a ${nuevoEstado}`);
        cargarPedidos();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || `Error al actualizar el pedido ${pedidoSeleccionado.id}`;
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setUpdatingId(null);
        setConfirmOpen(false);
        setPedidoSeleccionado(null);
        setNuevoEstado('');
      });
  };

  const handleEnviarAFabrica = (pedido) => {
    setUpdatingId(pedido.id);
    adminService
      .enviarAFabrica(pedido.id)
      .then(() => {
        toast.success('Pedido enviado a fábrica');
        cargarPedidos();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || `Error al enviar el pedido ${pedido.id} a fábrica`;
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setUpdatingId(null));
  };

  // Get available next states based on current state
  const getAvailableStates = (currentState) => {
    switch (currentState) {
      case ESTADOS.PENDIENTE_IMPRESION:
        return [ESTADOS.EN_PRODUCCION, ESTADOS.CANCELADO];
      case ESTADOS.EN_PRODUCCION:
        return [ESTADOS.ENVIADO, ESTADOS.CANCELADO];
      case ESTADOS.ENVIADO:
        return [ESTADOS.ENTREGADO];
      default:
        return [];
    }
  };

  // Get state badge color
  const getStateBadge = (estado) => {
    const classes = {
      PENDIENTE_IMPRESION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      EN_PRODUCCION: 'bg-blue-50 text-blue-700 border-blue-200',
      ENVIADO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      ENTREGADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CANCELADO: 'bg-red-50 text-red-700 border-red-200'
    };
    return classes[estado] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando pedidos...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state with retry
  if (error && pedidos.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6 border-red-200">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-700 font-medium">No se pudieron cargar los pedidos</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={cargarPedidos} className="border-red-200 text-red-700 hover:bg-red-100">
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
          <CardTitle>Gestionar Pedidos de Impresión</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisa y actualiza el estado de los pedidos de impresión 3D
          </p>
        </CardHeader>

        {/* Error banner (if error but we have pedidos loaded) */}
        {error && pedidos.length > 0 && (
          <div className="mx-6 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="link" size="sm" onClick={cargarPedidos} className="text-red-700">
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
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Diseño</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dirección</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Estado</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-muted-foreground">
                      No hay pedidos de impresión.
                    </td>
                  </tr>
                ) : (
                  pedidos.map((p) => {
                    const availableStates = getAvailableStates(p.estado);
                    const isUpdating = updatingId === p.id;

                    return (
                      <tr key={p.id} className="border-t hover:bg-slate-50">
                        <td className="px-3 py-2">{p.id}</td>
                        <td className="px-3 py-2">
                          {p.fechaSolicitud ? new Date(p.fechaSolicitud).toLocaleDateString('es-PE') : '-'}
                        </td>
                        <td className="px-3 py-2 font-medium">{p.clienteNombre || 'N/A'}</td>
                        <td className="px-3 py-2">{p.disenoNombre || 'N/A'}</td>
                        <td className="px-3 py-2 max-w-xs truncate" title={p.direccionEnvio}>
                          {p.direccionEnvio || '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStateBadge(p.estado)}`}>
                            {p.estado?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Special action: Send to factory */}
                            {p.estado === ESTADOS.PENDIENTE_IMPRESION && !p.codigoSeguimientoFabrica && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleEnviarAFabrica(p)}
                              >
                                {isUpdating ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Enviando...
                                  </>
                                ) : (
                                  'Enviar a Fábrica'
                                )}
                              </Button>
                            )}

                            {/* State change dropdown */}
                            {availableStates.length > 0 && (
                              <select
                                className="px-2 py-1 text-xs border rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUpdating}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    solicitarCambioEstado(p, e.target.value);
                                    e.target.value = ''; // Reset
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="">Cambiar estado...</option>
                                {availableStates.map(estado => (
                                  <option key={estado} value={estado}>
                                    {estado.replace(/_/g, ' ')}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* No actions available for terminal states */}
                            {availableStates.length === 0 && p.estado !== ESTADOS.PENDIENTE_IMPRESION && (
                              <span className="text-xs text-muted-foreground">
                                {p.estado === ESTADOS.ENTREGADO ? 'Completado' : 'Finalizado'}
                              </span>
                            )}
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
        title="Cambiar Estado del Pedido"
        message={
          pedidoSeleccionado
            ? `¿Cambiar el estado del pedido #${pedidoSeleccionado.id} a "${nuevoEstado?.replace(/_/g, ' ')}"?`
            : ''
        }
        confirmText={updatingId ? 'Actualizando...' : 'Confirmar'}
        cancelText="Cancelar"
        onConfirm={confirmarCambioEstado}
        onCancel={() => {
          setConfirmOpen(false);
          setPedidoSeleccionado(null);
          setNuevoEstado('');
        }}
      />
    </div>
  );
};

export default AdminPedidosPage;
