import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

const AdminPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarPedidos = () => {
    setLoading(true);
    setError('');
    // Cargar PENDIENTE_IMPRESION por defecto
    adminService
      .getPedidos('PENDIENTE_IMPRESION')
      .then((res) => setPedidos(res.data))
      .catch(() => setError('Error al cargar pedidos pendientes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleActualizarEstado = (id, estado) => {
    setError('');
    adminService
      .actualizarEstadoPedido(id, estado)
      .then(() => {
        // Recargar la lista de pendientes
        cargarPedidos();
      })
      .catch(() => setError(`Error al actualizar el pedido ${id}.`));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestionar Pedidos de Impresión (Pendientes)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando pedidos...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Pedidos de Impresión (Pendientes)</CardTitle>
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
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Diseño</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dirección</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-3 py-4 text-center text-slate-500">
                      No hay pedidos pendientes de impresión.
                    </td>
                  </tr>
                )}
                {pedidos.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">
                      {p.fechaSolicitud ? new Date(p.fechaSolicitud).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 py-2">{p.clienteNombre}</td>
                    <td className="px-3 py-2">{p.disenoNombre}</td>
                    <td className="px-3 py-2 max-w-lg break-words">{p.direccionEnvio}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleActualizarEstado(p.id, 'EN_PROCESO')}
                      >
                        Confirmar Producción
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleActualizarEstado(p.id, 'ENVIADO')}
                      >
                        Marcar Enviado
                      </Button>
                    </td>
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

export default AdminPedidosPage;