import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Button } from '../components/ui/button';
import { formatCurrencyPEN } from '../utils/currency';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

const AdminDashboardPage = () => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [reporteOpen, setReporteOpen] = useState(false);
  const [reporteJson, setReporteJson] = useState('');

  const cargarPendientes = () => {
    setLoading(true);
    setError('');
    adminService.getDisenosPendientes()
      .then(response => {
        setPendientes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar diseños pendientes.');
        setLoading(false);
      });
  };

  const cargarEstadisticas = () => {
    setStatsLoading(true);
    setStatsError('');
    adminService.getEstadisticasAdmin()
      .then(res => {
        setStats(res.data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsError('Error al cargar estadísticas.');
        setStatsLoading(false);
      });
  };

  useEffect(() => {
    cargarPendientes();
    cargarEstadisticas();
  }, []);

  const handleAprobar = (id) => {
    adminService.aprobarDiseno(id)
      .then(() => cargarPendientes())
      .catch(() => setError('No se pudo aprobar el diseño.'));
  };

  const handleRechazar = (id) => {
    adminService.rechazarDiseno(id)
      .then(() => cargarPendientes())
      .catch(() => setError('No se pudo rechazar el diseño.'));
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-4">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Cargando" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
      <h1 className="text-2xl font-semibold text-foreground mb-4">Panel de Administración</h1>
      <div className="mb-2">
        <Button variant="outline" onClick={() => {
          adminService.getReporteVentas()
            .then(res => { setReporteJson(JSON.stringify(res.data, null, 2)); setReporteOpen(true); })
            .catch(() => { setReporteJson('Error al generar reporte de ventas'); setReporteOpen(true); });
        }}>
          Generar Reporte de Ventas
        </Button>
      </div>
      {/* Estadísticas globales */}
      {statsError && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{statsError}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
      <h2 className="text-xl font-semibold mb-2">Diseños Pendientes de Revisión</h2>
      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="divide-y">
        {pendientes.length === 0 ? (
          <p className="text-muted-foreground">No hay diseños pendientes.</p>
        ) : (
          pendientes.map(diseno => (
            <div key={diseno.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{diseno.nombre}</div>
                <div className="text-sm text-muted-foreground">Por: {diseno.proveedor?.nombre || 'N/A'} | Categoría: {diseno.nombreCategoria || 'N/A'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="success" onClick={() => handleAprobar(diseno.id)}>Aprobar</Button>
                <Button variant="destructive" onClick={() => handleRechazar(diseno.id)}>Rechazar</Button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal para mostrar JSON del reporte */}
      <Dialog open={reporteOpen} onClose={() => setReporteOpen(false)} className="w-[90%] sm:w-[600px] p-4">
        <DialogHeader>
          <DialogTitle>Reporte de Ventas</DialogTitle>
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
    </div>
  );
};

export default AdminDashboardPage;