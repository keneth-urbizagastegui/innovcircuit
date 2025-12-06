import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { formatCurrencyPEN } from '../utils/currency';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import { Loader2, Search, Star } from 'lucide-react';

const AdminDashboardPage = () => {
  const [pendientes, setPendientes] = useState([]);
  const [aprobados, setAprobados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAprobados, setLoadingAprobados] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [reporteOpen, setReporteOpen] = useState(false);
  const [reporteJson, setReporteJson] = useState('');
  const [reporteData, setReporteData] = useState(null);
  const [reporteLoading, setReporteLoading] = useState(false);
  const [reporteError, setReporteError] = useState('');
  const [reporteVerJson, setReporteVerJson] = useState(false);

  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disenoARechazar, setDisenoARechazar] = useState(null);

  // Loading states for individual actions
  const [aprobarLoading, setAprobarLoading] = useState({});
  const [rechazarLoading, setRechazarLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState({});

  // Approved designs filter and search
  const [aprobadosFiltro, setAprobadosFiltro] = useState('todos'); // 'todos', 'destacados', 'categoria'
  const [aprobadosSearch, setAprobadosSearch] = useState('');
  const [aprobadosPage, setAprobadosPage] = useState(1);
  const pageSize = 10; // Diseños por página

  const cargarPendientes = () => {
    setLoading(true);
    setGlobalError('');
    adminService.getDisenosPendientes()
      .then(response => {
        setPendientes(response.data);
      })
      .catch((err) => {
        setGlobalError('Error al cargar diseños pendientes.');
        toast.error('Error al cargar diseños pendientes.');
      })
      .finally(() => setLoading(false));
  };

  const cargarEstadisticas = () => {
    setStatsLoading(true);
    setStatsError('');
    adminService.getEstadisticasAdmin()
      .then(res => {
        setStats(res.data);
      })
      .catch(() => {
        setStatsError('Error al cargar estadísticas.');
      })
      .finally(() => setStatsLoading(false));
  };

  const cargarAprobados = () => {
    setLoadingAprobados(true);
    adminService.getDisenosAprobados()
      .then(response => {
        setAprobados(response.data);
        setAprobadosPage(1); // Reset to page 1 when reloading
      })
      .catch(() => {
        toast.error('Error al cargar diseños aprobados.');
      })
      .finally(() => setLoadingAprobados(false));
  };

  const cargarTodo = () => {
    cargarPendientes();
    cargarEstadisticas();
    cargarAprobados();
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const handleAprobar = (id) => {
    setAprobarLoading(prev => ({ ...prev, [id]: true }));
    adminService.aprobarDiseno(id)
      .then(() => {
        toast.success('Diseño aprobado correctamente');
        cargarPendientes();
        cargarAprobados(); // Reload approved designs
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo aprobar el diseño.';
        toast.error(msg);
      })
      .finally(() => {
        setAprobarLoading(prev => ({ ...prev, [id]: false }));
      });
  };

  const solicitarRechazo = (id) => {
    setDisenoARechazar(id);
    setConfirmOpen(true);
  };

  const confirmarRechazo = () => {
    if (!disenoARechazar) return;
    setRechazarLoading(true);
    adminService.rechazarDiseno(disenoARechazar)
      .then(() => {
        toast.success('Diseño rechazado');
        cargarPendientes();
        cargarAprobados(); // Reload approved designs
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo rechazar el diseño.';
        toast.error(msg);
      })
      .finally(() => {
        setRechazarLoading(false);
        setConfirmOpen(false);
        setDisenoARechazar(null);
      });
  };

  const handleToggleFeatured = (id) => {
    setFeaturedLoading(prev => ({ ...prev, [id]: true }));
    adminService.toggleFeatured(id)
      .then(() => {
        toast.success('Estado destacado actualizado');
        cargarAprobados();
      })
      .catch(() => {
        toast.error('No se pudo actualizar el estado de destacado.');
      })
      .finally(() => {
        setFeaturedLoading(prev => ({ ...prev, [id]: false }));
      });
  };

  const handleAprobarTodos = () => {
    if (!window.confirm('¿Estás seguro de aprobar TODOS los pendientes?')) return;
    adminService.aprobarTodosPendientes()
      .then((res) => {
        const n = Number(res?.data?.aprobados ?? 0);
        toast.success(`Se aprobaron ${n} diseños pendientes.`);
        cargarPendientes();
        cargarAprobados();
      })
      .catch(() => toast.error('Error al aprobar todos los pendientes.'));
  };

  const handleGenerarReporte = () => {
    setReporteLoading(true);
    setReporteError('');
    setReporteVerJson(false);
    adminService.getReporteVentas()
      .then(res => {
        setReporteData(res.data);
        setReporteJson(JSON.stringify(res.data, null, 2));
        setReporteOpen(true);
      })
      .catch(() => {
        setReporteError('Error al generar reporte de ventas');
        setReporteData(null);
        setReporteJson('Error al generar reporte de ventas');
        setReporteOpen(true);
        toast.error('Error al generar reporte de ventas');
      })
      .finally(() => {
        setReporteLoading(false);
      });
  };

  // Derived data for approved designs
  const totalAprobados = aprobados.length;
  const totalDestacados = aprobados.filter(d => d.featured).length;

  let listaFiltrada = [...aprobados];

  // Apply search filter
  if (aprobadosSearch.trim()) {
    const searchLower = aprobadosSearch.toLowerCase();
    listaFiltrada = listaFiltrada.filter(d =>
      d.nombre?.toLowerCase().includes(searchLower) ||
      d.proveedor?.nombre?.toLowerCase().includes(searchLower)
    );
  }

  // Apply tab filter
  if (aprobadosFiltro === 'destacados') {
    listaFiltrada = listaFiltrada.filter(d => d.featured);
  }

  // Pagination calculations
  const totalItems = listaFiltrada.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ajustar página si está fuera de rango
  const currentPage = aprobadosPage > totalPages && totalPages > 0 ? totalPages : aprobadosPage;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const listaPaginada = listaFiltrada.slice(startIndex, endIndex);

  // Group by category for category view (use paginated list)
  const porCategoria = new Map();
  if (aprobadosFiltro === 'categoria') {
    listaPaginada.forEach(diseno => {
      const cat = diseno.nombreCategoria || 'Sin categoría';
      if (!porCategoria.has(cat)) {
        porCategoria.set(cat, []);
      }
      porCategoria.get(cat).push(diseno);
    });
  }

  // Global loading state
  if (loading && statsLoading && loadingAprobados) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Global error state
  if (globalError && !loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="p-6 bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-700 font-medium">No se pudieron cargar los datos del dashboard</p>
            <p className="text-sm text-red-600">{globalError}</p>
            <Button variant="outline" onClick={cargarTodo} className="border-red-200 text-red-700 hover:bg-red-100">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Panel de Administración</h1>

        {/* Report Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={handleGenerarReporte}
            disabled={reporteLoading}
          >
            {reporteLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generando...
              </>
            ) : (
              'Generar Reporte de Ventas'
            )}
          </Button>
        </div>

        {/* Estadísticas globales */}
        {statsError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {statsError}
            <Button variant="link" size="sm" onClick={cargarEstadisticas} className="ml-2 text-red-700">
              Reintentar
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-white shadow-sm">
            <div className="text-sm text-muted-foreground">Ventas Globales</div>
            {statsLoading ? (
              <div className="mt-1 h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <div className="text-lg font-semibold">{formatCurrencyPEN(Number(stats?.totalVentasGlobal ?? 0))}</div>
            )}
          </div>
          <div className="p-3 rounded-lg border border-border bg-white shadow-sm">
            <div className="text-sm text-muted-foreground">Comisiones Generadas</div>
            {statsLoading ? (
              <div className="mt-1 h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <div className="text-lg font-semibold">{formatCurrencyPEN(Number(stats?.totalComisiones ?? 0))}</div>
            )}
          </div>
        </div>

        {/* Diseños Pendientes */}
        <h2 className="text-xl font-semibold mb-3">Diseños Pendientes de Revisión</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="divide-y border rounded-lg">
              {pendientes.length === 0 ? (
                <div className="p-4 flex items-center justify-between">
                  <p className="text-muted-foreground">No hay diseños pendientes.</p>
                  <Button variant="outline" onClick={cargarPendientes} size="sm">
                    Refrescar
                  </Button>
                </div>
              ) : (
                pendientes.map(diseno => (
                  <div key={diseno.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{diseno.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        Por: {diseno.proveedor?.nombre || 'N/A'} | Cat: {diseno.nombreCategoria || 'N/A'} |
                        {' '}{diseno.precio > 0 ? formatCurrencyPEN(Number(diseno.precio)) : 'Gratuito'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAprobar(diseno.id)}
                        disabled={aprobarLoading[diseno.id]}
                      >
                        {aprobarLoading[diseno.id] ? (
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
                        onClick={() => solicitarRechazo(diseno.id)}
                        disabled={aprobarLoading[diseno.id]}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {pendientes.length > 0 && (
              <div className="mt-3">
                <Button onClick={handleAprobarTodos} variant="outline">
                  Aprobar todos los pendientes
                </Button>
              </div>
            )}
          </>
        )}

        {/* Diseños Aprobados - Enhanced */}
        <div className="mt-8">
          {/* Header with counters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Gestionar Diseños Aprobados (Curación)</h2>
              <p className="text-sm text-muted-foreground">Control de curación de diseños ya publicados</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Aprobados: {totalAprobados}
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Star className="h-3 w-3 mr-1" />
                Destacados: {totalDestacados}
              </Badge>
            </div>
          </div>

          {/* Search and Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={aprobadosSearch}
                onChange={(e) => { setAprobadosSearch(e.target.value); setAprobadosPage(1); }}
                placeholder="Buscar por nombre o proveedor..."
                className="pl-8"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => { setAprobadosFiltro('todos'); setAprobadosPage(1); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${aprobadosFiltro === 'todos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => { setAprobadosFiltro('destacados'); setAprobadosPage(1); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${aprobadosFiltro === 'destacados'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Destacados
              </button>
              <button
                type="button"
                onClick={() => { setAprobadosFiltro('categoria'); setAprobadosPage(1); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${aprobadosFiltro === 'categoria'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Por categoría
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          {loadingAprobados ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="border rounded-lg bg-slate-50/60">
              <div className="divide-y">
                {aprobados.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">No hay diseños aprobados.</p>
                  </div>
                ) : listaFiltrada.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">No hay resultados para el filtro/búsqueda actual.</p>
                  </div>
                ) : aprobadosFiltro === 'categoria' ? (
                  // Category grouped view
                  Array.from(porCategoria.entries()).map(([categoria, disenos]) => (
                    <div key={categoria} className="bg-white">
                      <div className="px-4 py-2 bg-slate-100 border-b">
                        <h3 className="text-sm font-semibold text-slate-700">{categoria}</h3>
                      </div>
                      <div className="divide-y">
                        {disenos.map(diseno => (
                          <div key={diseno.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-sm truncate">{diseno.nombre}</div>
                                {diseno.featured && (
                                  <Star className="h-3 w-3 text-yellow-600 fill-yellow-600" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                                <span>Por: {diseno.proveedor?.nombre || 'N/A'}</span>
                                <span>•</span>
                                <span>{diseno.precio > 0 ? formatCurrencyPEN(Number(diseno.precio)) : 'Gratis'}</span>
                                {diseno.likesCount != null && (
                                  <>
                                    <span>•</span>
                                    <span>{diseno.likesCount} ❤️</span>
                                  </>
                                )}
                                {diseno.descargasCount != null && (
                                  <>
                                    <span>•</span>
                                    <span>{diseno.descargasCount} ⬇️</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={diseno.featured ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleToggleFeatured(diseno.id)}
                              disabled={featuredLoading[diseno.id]}
                            >
                              {featuredLoading[diseno.id] ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  {diseno.featured ? 'Quitando...' : 'Destacando...'}
                                </>
                              ) : (
                                diseno.featured ? 'Quitar Destacado' : 'Destacar'
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // List view (Todos or Destacados)
                  listaPaginada.map(diseno => (
                    <div key={diseno.id} className="p-3 flex items-center justify-between gap-4 bg-white hover:bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-sm truncate">{diseno.nombre}</div>
                          {diseno.featured && (
                            <Star className="h-3 w-3 text-yellow-600 fill-yellow-600" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                          <span>Por: {diseno.proveedor?.nombre || 'N/A'}</span>
                          <span>•</span>
                          <span>Cat: {diseno.nombreCategoria || 'N/A'}</span>
                          <span>•</span>
                          <span>{diseno.precio > 0 ? formatCurrencyPEN(Number(diseno.precio)) : 'Gratis'}</span>
                          {diseno.likesCount != null && (
                            <>
                              <span>•</span>
                              <span>{diseno.likesCount} ❤️</span>
                            </>
                          )}
                          {diseno.descargasCount != null && (
                            <>
                              <span>•</span>
                              <span>{diseno.descargasCount} ⬇️</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={diseno.featured ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleFeatured(diseno.id)}
                        disabled={featuredLoading[diseno.id]}
                      >
                        {featuredLoading[diseno.id] ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            {diseno.featured ? 'Quitando...' : 'Destacando...'}
                          </>
                        ) : (
                          diseno.featured ? 'Quitar Destacado' : 'Destacar'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Paginación */}
              {listaFiltrada.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 text-sm text-muted-foreground border-t bg-white">
                  <span>
                    Página {aprobadosPage} de {totalPages}
                  </span>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      className="px-2 py-1 rounded border text-xs disabled:opacity-40 hover:bg-slate-50"
                      disabled={aprobadosPage === 1}
                      onClick={() => setAprobadosPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    {(() => {
                      const buttons = [];
                      const startPage = Math.max(1, aprobadosPage - 2);
                      const endPage = Math.min(totalPages, aprobadosPage + 2);
                      for (let page = startPage; page <= endPage; page++) {
                        const isActive = page === aprobadosPage;
                        buttons.push(
                          <button
                            key={page}
                            onClick={() => setAprobadosPage(page)}
                            className={
                              "px-2 py-1 rounded border text-xs " +
                              (isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-background hover:bg-muted")
                            }
                          >
                            {page}
                          </button>
                        );
                      }
                      return buttons;
                    })()}

                    <button
                      className="px-2 py-1 rounded border text-xs disabled:opacity-40 hover:bg-slate-50"
                      disabled={aprobadosPage === totalPages}
                      onClick={() => setAprobadosPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmOpen}
          title="Rechazar Diseño"
          message="¿Estás seguro de rechazar este diseño? El proveedor será notificado."
          confirmText={rechazarLoading ? 'Rechazando...' : 'Rechazar'}
          cancelText="Cancelar"
          onConfirm={confirmarRechazo}
          onCancel={() => { setConfirmOpen(false); setDisenoARechazar(null); }}
        />

        {/* Modal para mostrar reporte de ventas */}
        <Dialog open={reporteOpen} onClose={() => setReporteOpen(false)} className="w-[95%] sm:w-[800px] p-4">
          <DialogHeader>
            <DialogTitle>Reporte de Ventas</DialogTitle>
            <DialogDescription>
              Resumen consolidado de ventas de la plataforma.
            </DialogDescription>
          </DialogHeader>

          {/* Contenido principal del reporte */}
          <div className="space-y-4">
            {/* Errores */}
            {reporteError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {reporteError}
              </div>
            )}

            {/* Loading dentro del modal */}
            {reporteLoading && (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}

            {/* Contenido cuando hay datos */}
            {!reporteLoading && reporteData && (
              <>
                {/* Tarjetas de totales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-slate-50">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Ventas globales</div>
                    <div className="text-lg font-semibold">
                      {formatCurrencyPEN(Number(reporteData.totalVentasGlobal ?? 0))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-slate-50">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Comisiones generadas</div>
                    <div className="text-lg font-semibold">
                      {formatCurrencyPEN(Number(reporteData.totalComisiones ?? 0))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-slate-50">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Monto a proveedores</div>
                    <div className="text-lg font-semibold">
                      {formatCurrencyPEN(Number(reporteData.totalMontoProveedor ?? 0))}
                    </div>
                  </div>
                </div>

                {/* Tabla de ventas */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                    Detalle de ventas
                  </div>
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Fecha</th>
                          <th className="px-3 py-2 text-left">Cliente</th>
                          <th className="px-3 py-2 text-left">Diseños</th>
                          <th className="px-3 py-2 text-right">Total venta</th>
                          <th className="px-3 py-2 text-right">Comisión</th>
                          <th className="px-3 py-2 text-right">A proveedores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reporteData.ventas ?? []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                              No hay ventas registradas.
                            </td>
                          </tr>
                        ) : (
                          (reporteData.ventas ?? []).map((v) => (
                            <tr key={v.id} className="border-t">
                              <td className="px-3 py-2 align-top">
                                {v.fecha ? new Date(v.fecha).toLocaleString() : '-'}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {v.nombreCliente || 'N/A'}
                              </td>
                              <td className="px-3 py-2 align-top max-w-xs">
                                <div className="truncate" title={(v.disenosComprados || []).join(', ')}>
                                  {(v.disenosComprados || []).join(', ')}
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top text-right">
                                {formatCurrencyPEN(Number(v.montoTotal ?? 0))}
                              </td>
                              <td className="px-3 py-2 align-top text-right">
                                {formatCurrencyPEN(Number(v.comisionTotal ?? 0))}
                              </td>
                              <td className="px-3 py-2 align-top text-right">
                                {formatCurrencyPEN(Number(v.montoProveedorTotal ?? 0))}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Barra inferior: info + toggle JSON */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Total de ventas: {(reporteData.ventas ?? []).length}
                  </span>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReporteVerJson((prev) => !prev)}
                    >
                      {reporteVerJson ? 'Ocultar detalle técnico' : 'Ver detalle técnico (JSON)'}
                    </Button>
                  </div>
                </div>

                {/* Bloque opcional con JSON técnico */}
                {reporteVerJson && (
                  <div className="max-h-60 overflow-auto bg-black text-green-400 p-3 rounded text-xs font-mono">
                    <pre className="m-0">{reporteJson}</pre>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={() => setReporteOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
