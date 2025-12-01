import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';
import apiClient from '../services/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatCurrencyPEN } from '../utils/currency';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import disenoService from '../services/disenoService';
import ConfirmDialog from '../components/ConfirmDialog';
import { Textarea } from '../components/ui/textarea';
import pedidoService from '../services/pedidoService';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [reporteOpen, setReporteOpen] = useState(false);
  const [reporteJson, setReporteJson] = useState('');
  const [pedidoModalOpen, setPedidoModalOpen] = useState(false);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [pedidoError, setPedidoError] = useState('');
  const [pedidoLoading, setPedidoLoading] = useState(false);
  const [costoLoading, setCostoLoading] = useState(false);
  const [costoEstimado, setCostoEstimado] = useState(null);

  // Reclamos
  const [reclamoOpen, setReclamoOpen] = useState(false);
  const [reclamoMotivo, setReclamoMotivo] = useState('');
  const [reclamoLineaId, setReclamoLineaId] = useState(null);
  const [reclamoLoading, setReclamoLoading] = useState(false);
  const [reclamoError, setReclamoError] = useState('');

  const recargarMisDisenos = () => {
    usuarioService.getMisDisenos()
      .then(res => setDisenos(res.data))
      .catch(() => setError('Error al cargar diseños'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (user?.rol === 'CLIENTE') {
      usuarioService.getMisCompras()
        .then(res => setCompras(res.data))
        .catch(err => setError('Error al cargar compras'))
        .finally(() => setLoading(false));
    } else if (user?.rol === 'PROVEEDOR') {
      recargarMisDisenos();
      // Cargar estadísticas del proveedor
      setStatsLoading(true);
      setStatsError('');
      usuarioService.getMiDashboard()
        .then(res => setStats(res.data))
        .catch(() => setStatsError('Error al cargar estadísticas'))
        .finally(() => setStatsLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const recargarStats = () => {
    setStatsLoading(true);
    setStatsError('');
    usuarioService.getMiDashboard()
      .then(res => setStats(res.data))
      .catch(() => setStatsError('Error al cargar estadísticas'))
      .finally(() => setStatsLoading(false));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disenoAEliminar, setDisenoAEliminar] = useState(null);
  const solicitarEliminarDiseno = (id) => { setDisenoAEliminar(id); setConfirmOpen(true); };
  const confirmarEliminarDiseno = () => {
    if (!disenoAEliminar) return;
    disenoService.eliminarDiseno(disenoAEliminar)
      .then(() => recargarMisDisenos())
      .catch(() => setError('No se pudo eliminar el diseño'))
      .finally(() => { setConfirmOpen(false); setDisenoAEliminar(null); });
  };

  const handleEditarDiseno = (id) => {
    navigate(`/editar-diseno/${id}`);
  };

  const handleAbrirModalPedido = (linea) => {
    setSelectedLinea(linea);
    setDireccion('');
    setPedidoError('');
    setPedidoLoading(false);
    setPedidoModalOpen(true);
    setCostoLoading(true);
    setCostoEstimado(null);
    apiClient.get(`/pedidos/cotizar/${linea.disenoId}`)
      .then(res => {
        const v = res?.data?.costoEstimado;
        setCostoEstimado(typeof v === 'number' ? v : null);
      })
      .catch(() => setCostoEstimado(null))
      .finally(() => setCostoLoading(false));
  };

  const puedeReportar = (compraFecha, estadoFinanciero) => {
    if (!compraFecha) return false;
    const compraMs = new Date(compraFecha).getTime();
    const sieteDiasMs = 7 * 24 * 60 * 60 * 1000;
    const dentroDeSiete = (Date.now() - compraMs) < sieteDiasMs;
    const bloqueado = estadoFinanciero === 'EN_RECLAMO' || estadoFinanciero === 'REEMBOLSADO';
    return dentroDeSiete && !bloqueado;
  };

  const abrirReclamo = (linea) => {
    setReclamoLineaId(linea.id);
    setReclamoMotivo('');
    setReclamoError('');
    setReclamoLoading(false);
    setReclamoOpen(true);
  };

  const confirmarReclamo = async () => {
    if (!reclamoLineaId || !reclamoMotivo.trim()) {
      setReclamoError('El motivo del reclamo es obligatorio.');
      return;
    }
    setReclamoLoading(true);
    setReclamoError('');
    try {
      await usuarioService.crearReclamo({ lineaId: reclamoLineaId, motivo: reclamoMotivo });
      setReclamoOpen(false);
      toast.success('Reclamo enviado');
      // Recargar compras para reflejar estado EN_RECLAMO
      usuarioService.getMisCompras()
        .then(res => setCompras(res.data))
        .catch(() => {});
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al enviar el reclamo.';
      setReclamoError(msg);
    } finally {
      setReclamoLoading(false);
    }
  };

  const handleConfirmarPedido = async () => {
    if (!selectedLinea || !direccion.trim()) {
      setPedidoError('La dirección de envío es obligatoria.');
      return;
    }
    setPedidoLoading(true);
    setPedidoError('');
    try {
      const pedidoData = {
        disenoId: selectedLinea.disenoId,
        direccionEnvio: direccion,
      };
      await pedidoService.crearPedido(pedidoData);
      setPedidoModalOpen(false);
      toast.success('Solicitud de impresión enviada');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al crear el pedido.';
      setPedidoError(msg);
    } finally {
      setPedidoLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center mt-8">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Cargando" />
    </div>
  );
  if (error) return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Mi Panel</h1>
      <p className="text-muted-foreground">Hola, {user?.sub}</p>

      {user?.rol === 'CLIENTE' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Mi Biblioteca de Diseños (Compras)</h2>
            <Button variant="outline" onClick={() => navigate('/dashboard/pedidos')}>
              Ver Mis Pedidos de Impresión
            </Button>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="mb-2">
            <Button variant="outline" onClick={() => {
              usuarioService.getReporteMisCompras()
                .then(res => { setReporteJson(JSON.stringify(res.data, null, 2)); setReporteOpen(true); })
                .catch(() => { setReporteJson('Error al generar reporte de compras'); setReporteOpen(true); });
            }}>
              Generar Reporte de Mis Compras
            </Button>
          </div>
          <div className="divide-y">
            {compras.length === 0 && <p className="text-muted-foreground">No has realizado compras.</p>}
            {/* Iterar sobre compras y luego sobre líneas de venta */}
            {compras.flatMap(compra =>
              (compra.lineas || []).map(linea => (
                <div key={linea.id} className="py-3 grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <div>
                    <div className="font-medium">{linea.disenoNombre}</div>
                    <div className="text-sm text-muted-foreground">
                      Comprado el: {new Date(compra.fecha).toLocaleDateString()} | Precio: {formatCurrencyPEN(linea.precioAlComprar)}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {linea.estadoFinanciero === 'EN_RECLAMO' && (
                        <Badge className="border border-yellow-500 text-yellow-600" variant="outline">En revisión por Admin</Badge>
                      )}
                      {linea.estadoFinanciero === 'REEMBOLSADO' && (
                        <Badge className="border border-red-500 text-red-600" variant="outline">Reembolsado</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => handleAbrirModalPedido(linea)}>
                      Solicitar Impresión
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {puedeReportar(compra.fecha, linea.estadoFinanciero) && (
                      <Button variant="outline" size="sm" onClick={() => abrirReclamo(linea)}>
                        Reportar Problema
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {user?.rol === 'PROVEEDOR' && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Mis Diseños Subidos</h2>
          <div className="h-px bg-border my-2" />
          {/* Estadísticas del proveedor */}
          <div className="mb-2">
            {statsError && (
              <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{statsError}</div>
            )}
            {statsLoading ? (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Cargando" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <div className="p-3 rounded-lg border border-border bg-white shadow-sm">
                  <div className="text-sm text-muted-foreground">Total Vendido</div>
                  <div className="text-lg font-semibold">S/{Number(stats?.totalVendido ?? 0).toFixed(2)}</div>
                </div>
                <div className="p-3 rounded-lg border border-yellow-500 bg-white shadow-sm">
                  <div className="text-sm text-yellow-600">Saldo Pendiente (En canje)</div>
                  <div className="text-lg font-semibold text-yellow-600">{formatCurrencyPEN(Number(stats?.saldoPendiente ?? 0))}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-white shadow-sm">
                  <div className="text-sm text-muted-foreground">Ganancia Neta (Tras comisiones)</div>
                  <div className="text-lg font-semibold">{formatCurrencyPEN(Number(stats?.gananciaNeta ?? 0))}</div>
                </div>
              </div>
            )}
            {/* Botones para ver historial y gestionar retiros */}
            <div className="mt-2 flex gap-2 items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/dashboard/transacciones')}>
                  Ver Historial de Transacciones
                </Button>
                <Button variant="default" onClick={() => navigate('/dashboard/retiros')}>
                  Gestionar Retiros
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/reportes')}>
                  Ver Reportes
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={async () => {
                try {
                  await apiClient.post('/test/time-travel', null, { params: { dias: 8 } });
                  toast.success('Simulación (+8 días) realizada');
                  recargarStats();
                } catch (e) {
                  toast.error('Error al simular paso del tiempo');
                }
              }}>
                🛠️ Simular paso del tiempo (+8 días)
              </Button>
            </div>
          </div>
          <div className="divide-y">
            {disenos.length === 0 ? <p className="text-muted-foreground">No has subido diseños.</p> : null}
            {disenos.map(diseno => (
              <div key={diseno.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{diseno.nombre}</div>
                  <div className="text-sm text-muted-foreground">Estado: {diseno.estado} | Precio: {formatCurrencyPEN(Number(diseno.precio ?? 0))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" aria-label="editar" onClick={() => handleEditarDiseno(diseno.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" aria-label="eliminar" onClick={() => solicitarEliminarDiseno(diseno.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Confirmación de eliminación de diseño */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar diseño"
        message="¿Eliminar este diseño? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminarDiseno}
        onCancel={() => { setConfirmOpen(false); setDisenoAEliminar(null); }}
      />

      {/* Modal para mostrar JSON del reporte */}
      <Dialog open={reporteOpen} onClose={() => setReporteOpen(false)} className="w-[90%] sm:w-[600px] p-4">
        <DialogHeader>
          <DialogTitle>Reporte de Compras</DialogTitle>
          <DialogDescription>
            Resultado en formato JSON
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-auto bg-black text-green-400 p-3 rounded">
          <pre className="m-0">{reporteJson}</pre>
        </div>
        <DialogFooter>
          <Button onClick={() => setReporteOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </Dialog>

      {/* Modal para crear reclamo */}
      <Dialog open={reclamoOpen} onClose={() => setReclamoOpen(false)} className="w-[90%] sm:w-[500px] p-4">
        <DialogHeader>
          <DialogTitle>Reportar Problema</DialogTitle>
          <DialogDescription>
            Describe el motivo del reclamo.
            {reclamoError && (
              <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {reclamoError}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <label className="text-sm font-medium text-slate-700">Motivo del reclamo</label>
          <Textarea
            rows={3}
            value={reclamoMotivo}
            onChange={(e) => setReclamoMotivo(e.target.value)}
            placeholder="Describe el problema con el diseño..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReclamoOpen(false)} disabled={reclamoLoading}>
            Cancelar
          </Button>
          <Button onClick={confirmarReclamo} disabled={reclamoLoading || !reclamoMotivo.trim()}>
            {reclamoLoading ? 'Enviando...' : 'Enviar Reclamo'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal para solicitar impresión */}
      <Dialog open={pedidoModalOpen} onClose={() => setPedidoModalOpen(false)} className="w-[90%] sm:w-[500px] p-4">
      <DialogHeader>
        <DialogTitle>Solicitar Impresión Física</DialogTitle>
        <DialogDescription>
          Estás solicitando la impresión del diseño: <strong>{selectedLinea?.disenoNombre}</strong>.
          {pedidoError && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {pedidoError}
            </div>
          )}
          <div className="mt-2 text-sm">
            {costoLoading ? (
              <span>Costo Estimado de Fabricación: Cargando...</span>
            ) : costoEstimado != null ? (
              <span>Costo Estimado de Fabricación: S/ {Number(costoEstimado).toFixed(2)}</span>
            ) : (
              <span>No se pudo cotizar el costo de fabricación.</span>
            )}
          </div>
        </DialogDescription>
      </DialogHeader>
        <div className="py-2">
          <label className="text-sm font-medium text-slate-700">Dirección de Envío Completa</label>
          <Textarea
            rows={3}
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Av. Siempre Viva 123, Sprinfield, Perú..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPedidoModalOpen(false)} disabled={pedidoLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmarPedido} disabled={pedidoLoading || !direccion.trim()}>
            {pedidoLoading ? 'Confirmando...' : 'Confirmar Pedido'}
          </Button>
        </DialogFooter>
      </Dialog>
      </div>
    </div>
  );
};

export default DashboardPage;
