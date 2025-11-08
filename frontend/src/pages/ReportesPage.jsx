import React, { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Loader2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from '../components/ui/button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ReportesPage = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    usuarioService
      .getMisTransacciones()
      .then((res) => setLineas(res.data))
      .catch(() => setError('Error al cargar las transacciones.'))
      .finally(() => setLoading(false));
  }, []);

  // Procesar datos para el gráfico
  const procesarDatosGrafico = () => {
    // Agrupar ganancias por día
    const gananciasPorDia = lineas.reduce((acc, linea) => {
      const fecha = new Date(linea.fechaVenta).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const monto = linea.montoProveedor || 0;
      acc[fecha] = (acc[fecha] || 0) + monto;
      return acc;
    }, {});

    // Ordenar por fecha (las claves pueden no estar ordenadas)
    const sortedKeys = Object.keys(gananciasPorDia).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/');
      const [dayB, monthB, yearB] = b.split('/');
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
    });

    const labels = sortedKeys;
    const data = sortedKeys.map((key) => gananciasPorDia[key]);

    return {
      labels,
      datasets: [
        {
          label: 'Ganancia Neta por Día (S/)',
          data: data,
          fill: false,
          borderColor: 'rgb(14, 165, 233)', // sky-500
          tension: 0.1,
        },
      ],
    };
  };

  const chartData = loading ? { labels: [], datasets: [] } : procesarDatosGrafico();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolución de Ganancias Netas',
      },
    },
  };

  // Exportación a CSV
  const exportarCSV = () => {
    if (lineas.length === 0) return;

    const headers =
      'ID_Linea,Fecha_Venta,ID_Diseño,Nombre_Diseño,Precio_Venta,Comision_Plataforma,Ganancia_Proveedor\n';
    const csvRows = lineas.map((l) => {
      const fecha = new Date(l.fechaVenta).toISOString().split('T')[0];
      return [
        l.id,
        fecha,
        l.disenoId,
        `"${(l.disenoNombre || '').replace(/"/g, '""')}"`, // Escapar comillas
        l.precioAlComprar,
        l.comisionPlataforma,
        l.montoProveedor,
      ].join(',');
    });
    const csvContent = headers + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_transacciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Reportes de Proveedor</CardTitle>
        <Button
          variant="outline"
          onClick={exportarCSV}
          disabled={loading || lineas.length === 0}
        >
          Exportar a CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Line options={chartOptions} data={chartData} />
        )}
      </CardContent>
      </Card>
    </div>
  );
};

export default ReportesPage;