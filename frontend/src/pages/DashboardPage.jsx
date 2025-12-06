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
import { Pencil, Trash2, Printer, FileText, ShoppingBag, Upload, Package } from 'lucide-react';
import disenoService from '../services/disenoService';
import ConfirmDialog from '../components/ConfirmDialog';
import { Textarea } from '../components/ui/textarea';
import pedidoService from '../services/pedidoService';
import { resolveImageUrl, FALLBACK_IMAGE, onErrorSetSrc } from '../utils/imageUtils';

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
  const [reporteData, setReporteData] = useState([]);
  const [pedidoModalOpen, setPedidoModalOpen] = useState(false);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [tipoEnvio, setTipoEnvio] = useState('DOMICILIO'); // 'DOMICILIO' o 'RECOJO_TIENDA'
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

  // Paginación de Mis Diseños
  const [paginaDisenos, setPaginaDisenos] = useState(1);
  const TAMANO_PAGINA_DISENOS = 10;

  const recargarMisDisenos = () => {
    usuarioService.getMisDisenos()
      .then(res => {
        setDisenos(res.data);
        setPaginaDisenos(1); // Reset paginación al recargar
      })
      .catch(() => setError('Error al cargar diseños'))
      .finally(() => setLoading(false));
  };

  const [reporteLoading, setReporteLoading] = useState(false);
  const [reporteError, setReporteError] = useState('');
  const [mostrarJsonDetalle, setMostrarJsonDetalle] = useState(false); // toggle para ver/ocultar JSON

  const cargarDatos = () => {
    setLoading(true);
    setError('');
    if (user?.rol === 'CLIENTE') {
      usuarioService.getMisCompras()
        .then(res => setCompras(res.data))
        .catch(err => setError('Error al cargar compras. Por favor, intenta nuevamente.'))
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
  };

  useEffect(() => {
    cargarDatos();
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
    setTipoEnvio('DOMICILIO');
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

  // Verificar si se puede reportar un problema (dentro de 7 días y estado no bloqueado)
  // Regla de negocio: El cliente solo puede reclamar dentro de los 7 días naturales posteriores a la compra.
  // Además, no puede abrir otro reclamo si la línea ya está en proceso de reclamo o fue reembolsada.
  const puedeReportar = (compraFecha, estadoFinanciero) => {
    if (!compraFecha) return false;
    const compraMs = new Date(compraFecha).getTime();
    const sieteDiasMs = 7 * 24 * 60 * 60 * 1000;
    const dentroDeSiete = (Date.now() - compraMs) < sieteDiasMs;

    // Estados que bloquean un nuevo reclamo
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
      toast.success('Reclamo enviado correctamente. El administrador revisará el caso.');
      // Recargar compras para reflejar estado EN_RECLAMO
      cargarDatos();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al enviar el reclamo.';
      setReclamoError(msg);
    } finally {
      setReclamoLoading(false);
    }
  };

  const handleConfirmarPedido = async () => {
    if (tipoEnvio === 'DOMICILIO' && !direccion.trim()) {
      setPedidoError('La dirección de envío es obligatoria para el envío a domicilio.');
      return;
    }
    setPedidoLoading(true);
    setPedidoError('');
    try {
      const pedidoData = {
        disenoId: selectedLinea.disenoId,
        direccionEnvio: tipoEnvio === 'DOMICILIO'
          ? direccion
          : 'RECOJO EN TIENDA (se coordinará la dirección con soporte)',
      };
      await pedidoService.crearPedido(pedidoData);
      setPedidoModalOpen(false);
      setDireccion(''); // Resetear formulario
      setTipoEnvio('DOMICILIO');
      toast.success('Pedido de impresión creado correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al crear el pedido.';
      setPedidoError(msg);
    } finally {
      setPedidoLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-12 gap-3">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" aria-label="Cargando" />
      <p className="text-sm text-muted-foreground">Cargando tu panel...</p>
    </div>
  );
  if (error) return (
    <div className="mx-auto max-w-lg mt-8 p-6 border border-red-200 bg-red-50 rounded-xl text-center">
      <p className="text-red-700 mb-4">{error}</p>
      <Button onClick={cargarDatos} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
        Reintentar
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Mi Panel</h1>
        <p className="text-muted-foreground">Hola, {user?.sub}</p>

        {user?.rol === 'CLIENTE' && (
          <div className="mt-4">
            <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 p-5 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Mi Biblioteca de Diseños (Compras)</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/dashboard/pedidos')}>
                    <Printer className="h-4 w-4 mr-2" /> Ver Mis Pedidos de Impresión
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setReporteData([]);
                    setReporteError('');
                    setReporteLoading(true);
                    setMostrarJsonDetalle(false); // por defecto, ocultar JSON
                    setReporteOpen(true);
                    usuarioService.getReporteMisCompras()
                      .then(res => setReporteData(Array.isArray(res.data) ? res.data : []))
                      .catch(() => {
                        setReporteData([]);
                        setReporteError("No se pudo generar el reporte. Intenta más tarde.");
                        setMostrarJsonDetalle(true); // si hay error, mostrar mensaje
                      })
                      .finally(() => setReporteLoading(false));
                  }}>
                    <FileText className="h-4 w-4 mr-2" /> Generar Reporte
                  </Button>
                </div>
              </div>
            </div>
            {/* Resumen visual de compras */}
            {compras.length > 0 && (() => {
              const allLineas = compras.flatMap(c => c.lineas || []);
              const totalCompras = allLineas.length;
              const totalGastado = allLineas.reduce((acc, l) => acc + (l.precioAlComprar || 0), 0);
              const totalReembolsado = allLineas
                .filter(l => l.estadoFinanciero === 'REEMBOLSADO')
                .reduce((acc, l) => acc + (l.precioAlComprar || 0), 0);

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-4 rounded-xl border border-teal-200 bg-teal-50 shadow-sm">
                    <p className="text-sm text-teal-700 font-medium">Total Diseños Comprados</p>
                    <p className="text-3xl font-bold text-teal-900 mt-1">{totalCompras}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
                    <p className="text-sm text-blue-700 font-medium">Total Gastado</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{formatCurrencyPEN(totalGastado)}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-orange-200 bg-orange-50 shadow-sm">
                    <p className="text-sm text-orange-700 font-medium">Total Reembolsado</p>
                    <p className="text-3xl font-bold text-orange-900 mt-1">{formatCurrencyPEN(totalReembolsado)}</p>
                  </div>
                </div>
              );
            })()}

            <div className="grid gap-3">
              {compras.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <p className="text-muted-foreground mb-4">Todavía no has comprado ningún diseño.</p>
                  <Button onClick={() => navigate('/')}>
                    Ir al catálogo
                  </Button>
                </div>
              )}
              {compras.flatMap(compra =>
                (compra.lineas || []).map(linea => (
                  <div key={linea.id} className="rounded-lg border border-border bg-white p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div className="min-w-0">
                      <div className="font-medium truncate text-lg">{linea.disenoNombre}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="mr-3">📅 {new Date(compra.fecha).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="mr-3 font-medium">
                          {linea.precioAlComprar === 0 ? (
                            <span className="text-green-600">Gratis</span>
                          ) : (
                            formatCurrencyPEN(linea.precioAlComprar)
                          )}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {linea.estadoFinanciero === 'EN_RECLAMO' && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">En Reclamo</Badge>
                        )}
                        {linea.estadoFinanciero === 'REEMBOLSADO' && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Reembolsado</Badge>
                        )}
                        {linea.estadoFinanciero === 'PAGADO_AL_PROVEEDOR' && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">Completado</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" onClick={() => handleAbrirModalPedido(linea)}>
                        <ShoppingBag className="h-4 w-4 mr-2" /> Solicitar Impresión
                      </Button>
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
          <div className="mt-4 space-y-6">
            {/* Estadísticas del proveedor */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Resumen de Actividad</h2>
              {statsError && (
                <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{statsError}</div>
              )}
              {statsLoading ? (
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Cargando" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-white shadow-sm flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium">Total Vendido</span>
                    <span className="text-2xl font-bold text-slate-900 mt-1">S/{Number(stats?.totalVendido ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm flex flex-col">
                    <span className="text-sm text-yellow-700 font-medium">Saldo Pendiente</span>
                    <span className="text-2xl font-bold text-yellow-800 mt-1">{formatCurrencyPEN(Number(stats?.saldoPendiente ?? 0))}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm flex flex-col">
                    <span className="text-sm text-emerald-700 font-medium">Ganancia Neta</span>
                    <span className="text-2xl font-bold text-emerald-800 mt-1">{formatCurrencyPEN(Number(stats?.gananciaNeta ?? 0))}</span>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="mt-4 flex flex-wrap gap-3 items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/transacciones')}>
                    <FileText className="h-4 w-4 mr-2" /> Historial
                  </Button>
                  <Button variant="default" size="sm" onClick={() => navigate('/dashboard/retiros')}>
                    <ShoppingBag className="h-4 w-4 mr-2" /> Retiros
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/reportes')}>
                    <Printer className="h-4 w-4 mr-2" /> Reportes
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={async () => {
                  try {
                    await apiClient.post('/test/time-travel', null, { params: { dias: 8 } });
                    toast.success('Simulación (+8 días) realizada');
                    recargarStats();
                    recargarMisDisenos();
                  } catch (e) {
                    toast.error('Error al simular paso del tiempo');
                  }
                }}>
                  🛠️ Simular tiempo (+8d)
                </Button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Mis Diseños</h2>
                <Button onClick={() => navigate('/subir-diseno')}>
                  <Upload className="h-4 w-4 mr-2" /> Subir Nuevo Diseño
                </Button>
              </div>
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                {disenos.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Todavía no has publicado ningún diseño</h3>
                    <p className="text-slate-500 mt-1 mb-6 max-w-sm mx-auto">Comparte tu creatividad con el mundo. Sube tu primer diseño y comienza a vender.</p>
                    <Button onClick={() => navigate('/subir-diseno')}>
                      Subir mi primer diseño
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {(() => {
                      // Paginación
                      const totalDisenos = disenos.length;
                      const totalPaginasDisenos = Math.max(1, Math.ceil(totalDisenos / TAMANO_PAGINA_DISENOS));
                      const inicioIndice = (paginaDisenos - 1) * TAMANO_PAGINA_DISENOS;
                      const finIndice = inicioIndice + TAMANO_PAGINA_DISENOS;
                      const disenosPaginados = disenos.slice(inicioIndice, finIndice);

                      return disenosPaginados.map(diseno => (
                        <div key={diseno.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                          {/* Imagen */}
                          <div className="h-20 w-20 flex-shrink-0 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                            <img
                              src={resolveImageUrl(diseno.imagenUrl) || FALLBACK_IMAGE}
                              onError={onErrorSetSrc(FALLBACK_IMAGE)}
                              alt={diseno.nombre}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 truncate">{diseno.nombre}</h3>
                              <Badge variant={diseno.estado === 'APROBADO' ? 'default' : 'secondary'}
                                className={
                                  diseno.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    diseno.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700 border-red-200' :
                                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }>
                                {diseno.estado}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500 space-y-0.5">
                              <p>Categoría: <span className="font-medium text-slate-700">{diseno.nombreCategoria || 'Sin categoría'}</span></p>
                              <p>
                                Precio: <span className={`font-medium ${diseno.precio === 0 ? 'text-green-600' : 'text-slate-700'}`}>
                                  {diseno.precio === 0 || diseno.gratuito ? 'Gratis' : formatCurrencyPEN(diseno.precio)}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 sm:self-center self-end">
                            <Button variant="outline" size="sm" onClick={() => handleEditarDiseno(diseno.id)}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => solicitarEliminarDiseno(diseno.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Controles de paginación */}
                {disenos.length > TAMANO_PAGINA_DISENOS && (
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                    <p className="text-sm text-slate-500">
                      Mostrando {((paginaDisenos - 1) * TAMANO_PAGINA_DISENOS) + 1}–{Math.min(paginaDisenos * TAMANO_PAGINA_DISENOS, disenos.length)} de {disenos.length} diseños
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaDisenos(p => Math.max(1, p - 1))}
                        disabled={paginaDisenos === 1}
                      >
                        Anterior
                      </Button>
                      {Array.from({ length: Math.ceil(disenos.length / TAMANO_PAGINA_DISENOS) }).map((_, idx) => {
                        const pageNumber = idx + 1;
                        const isActive = pageNumber === paginaDisenos;
                        return (
                          <Button
                            key={pageNumber}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPaginaDisenos(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaDisenos(p => Math.min(Math.ceil(disenos.length / TAMANO_PAGINA_DISENOS), p + 1))}
                        disabled={paginaDisenos >= Math.ceil(disenos.length / TAMANO_PAGINA_DISENOS)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
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

        {/* Modal para mostrar reporte de compras (cliente) */}
        <Dialog open={reporteOpen} onClose={() => setReporteOpen(false)} className="w-[95%] sm:w-[700px] p-4">
          <DialogHeader>
            <DialogTitle>Reporte de Compras</DialogTitle>
            <DialogDescription>
              Resumen de tus compras. Abajo puedes ver el detalle técnico en formato JSON solo si lo necesitas.
            </DialogDescription>
          </DialogHeader>

          {/* Capa de resumen visual */}
          <div className="space-y-3">
            {reporteLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : reporteError ? (
              <div className="text-red-600 text-center py-4">{reporteError}</div>
            ) : (
              <>
                {/* Cards de resumen (total compras, montos, etc.) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {(() => {
                    const data = Array.isArray(reporteData) ? reporteData : [];
                    const totalCompras = data.length;
                    const montoTotal = data.reduce((acc, v) => acc + (Number(v.montoTotal) || 0), 0);
                    const comisionTotal = data.reduce((acc, v) => acc + (Number(v.comisionTotal) || 0), 0);
                    const montoProveedorTotal = data.reduce((acc, v) => acc + (Number(v.montoProveedorTotal) || 0), 0);

                    return (
                      <>
                        <div className="p-3 rounded-lg border bg-slate-50 flex flex-col">
                          <span className="text-xs text-slate-500">Total de Compras</span>
                          <span className="mt-1 text-xl font-semibold">{totalCompras}</span>
                        </div>
                        <div className="p-3 rounded-lg border bg-blue-50 flex flex-col">
                          <span className="text-xs text-slate-500">Monto Total</span>
                          <span className="mt-1 text-lg font-semibold text-blue-700">
                            {formatCurrencyPEN(montoTotal)}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border bg-amber-50 flex flex-col">
                          <span className="text-xs text-slate-500">Comisión Total</span>
                          <span className="mt-1 text-lg font-semibold text-amber-700">
                            {formatCurrencyPEN(comisionTotal)}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border bg-emerald-50 flex flex-col">
                          <span className="text-xs text-slate-500">A Proveedores</span>
                          <span className="mt-1 text-lg font-semibold text-emerald-700">
                            {formatCurrencyPEN(montoProveedorTotal)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Tabla resumida de compras */}
                <div className="mt-2">
                  <h3 className="text-sm font-semibold mb-1">Detalle de compras</h3>
                  <div className="max-h-52 overflow-auto border rounded-md">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-2 py-1 text-left">Fecha</th>
                          <th className="px-2 py-1 text-left">Diseños</th>
                          <th className="px-2 py-1 text-right">Monto</th>
                          <th className="px-2 py-1 text-right">Comisión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const data = Array.isArray(reporteData) ? reporteData : [];
                          if (!data.length) {
                            return (
                              <tr>
                                <td colSpan={4} className="px-2 py-2 text-center text-slate-500">
                                  No hay datos disponibles.
                                </td>
                              </tr>
                            );
                          }
                          return data.map((venta) => (
                            <tr key={venta.id} className="border-t">
                              <td className="px-2 py-1">
                                {venta.fecha ? new Date(venta.fecha).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-2 py-1">
                                {(venta.disenosComprados || []).join(', ')}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatCurrencyPEN(Number(venta.montoTotal || 0))}
                              </td>
                              <td className="px-2 py-1 text-right">
                                {formatCurrencyPEN(Number(venta.comisionTotal || 0))}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Toggle para ver/ocultar el JSON técnico */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    El siguiente detalle técnico en JSON es opcional y está pensado para revisión técnica / académica.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarJsonDetalle((v) => !v)}
                  >
                    {mostrarJsonDetalle ? 'Ocultar detalle técnico' : 'Ver detalle técnico (JSON)'}
                  </Button>
                </div>

                {mostrarJsonDetalle && (
                  <div className="mt-2 max-h-[260px] overflow-auto bg-black text-green-400 p-3 rounded">
                    <pre className="m-0 text-xs whitespace-pre-wrap break-all">{JSON.stringify(reporteData, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="mt-4">
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
        <Dialog open={pedidoModalOpen} onClose={() => setPedidoModalOpen(false)} className="w-[90%] sm:w-[600px] p-4">
          <DialogHeader>
            <DialogTitle>Solicitar Impresión Física</DialogTitle>
            <DialogDescription>
              Completa los datos para solicitar la impresión de tu diseño.
              {pedidoError && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {pedidoError}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Resumen visual */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Diseño</div>
              <div className="font-medium">{selectedLinea?.disenoNombre}</div>
              <div className="text-xs text-slate-500">
                Precio original: {formatCurrencyPEN(Number(selectedLinea?.precioAlComprar ?? 0))}
              </div>
            </div>
            <div className="p-2 rounded-md bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Costo estimado de fabricación</div>
              <div className="font-semibold">
                {costoLoading
                  ? 'Cargando...'
                  : costoEstimado != null
                    ? `S/ ${Number(costoEstimado).toFixed(2)}`
                    : 'No disponible'}
              </div>
              <div className="text-xs text-slate-500">
                Este costo es referencial y no incluye envío.
              </div>
            </div>
          </div>

          {/* Método de entrega */}
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700">Método de entrega</label>
            <div className="mt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                className={`flex-1 rounded-md border px-3 py-2 text-sm text-left ${tipoEnvio === 'DOMICILIO' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'
                  }`}
                onClick={() => setTipoEnvio('DOMICILIO')}
              >
                <div className="font-medium">Envío a domicilio</div>
                <div className="text-xs text-slate-500">Recibes el diseño impreso en tu dirección.</div>
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md border px-3 py-2 text-sm text-left ${tipoEnvio === 'RECOJO_TIENDA' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'
                  }`}
                onClick={() => setTipoEnvio('RECOJO_TIENDA')}
              >
                <div className="font-medium">Recojo en tienda</div>
                <div className="text-xs text-slate-500">Coordinarás el punto de recojo con el equipo de InnovCircuit.</div>
              </button>
            </div>
          </div>

          {/* Dirección de envío (solo si es DOMICILIO) */}
          <div className="py-2">
            {tipoEnvio === 'DOMICILIO' ? (
              <>
                <label className="text-sm font-medium text-slate-700">Dirección de Envío Completa</label>
                <Textarea
                  rows={3}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Siempre Viva 123, Springfield, Perú..."
                  className="mt-1"
                />
              </>
            ) : (
              <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-sm">
                <div className="font-medium text-blue-900">Recojo en tienda</div>
                <div className="text-xs text-blue-700 mt-1">
                  Una vez confirmado el pedido, nuestro equipo se pondrá en contacto contigo para coordinar el punto de recojo.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPedidoModalOpen(false)} disabled={pedidoLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarPedido}
              disabled={pedidoLoading || (tipoEnvio === 'DOMICILIO' && !direccion.trim())}
            >
              {pedidoLoading ? 'Confirmando...' : 'Confirmar Pedido'}
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
};

export default DashboardPage;
