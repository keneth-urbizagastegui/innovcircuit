import React, { useEffect, useState } from 'react';
import disenoService from '../services/disenoService';
import DisenoCard from '../components/DisenoCard';
import iaService from '../services/iaService';

const HomePage = () => {
  // const auth = useAuth(); // Ya no es necesario para esta lógica
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true); // Empezar cargando
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    // Cargar diseños al montar el componente, para todos.
    setLoading(true);
    disenoService
      .listarDisenosAprobados()
      .then((response) => {
        setDisenos(response.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback de desarrollo: mostrar datos simulados si el backend no responde
        const fallbackDisenos = [
          {
            id: 1001,
            nombre: 'Fuente Conmutada 12V/5A',
            nombreCategoria: 'Fuentes de Poder',
            proveedor: { nombre: 'Proveedor Demo', avatarUrl: '' },
            imagenUrl: '',
            precio: 29.99,
            gratuito: false,
            descargasCount: 57,
            likesCount: 23,
          },
          {
            id: 1002,
            nombre: 'Sensor de Temperatura Digital',
            nombreCategoria: 'Sensores',
            proveedor: { nombre: 'ElectroLab', avatarUrl: '' },
            imagenUrl: '',
            precio: 0,
            gratuito: true,
            descargasCount: 105,
            likesCount: 40,
          },
        ];
        setDisenos(fallbackDisenos);
        setError('Mostrando catálogo de ejemplo: la API no respondió.');
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    // búsqueda removida del home por requerimiento (se mantiene carga normal)
  };

  const handleIaSearch = () => {
    // opción IA deshabilitada temporalmente para simplificar el catálogo
  };

  // Sincronización con query removida al eliminar barra de búsqueda

  // Renderizado condicional (público, sin depender de auth)
  let content;
  if (loading) {
    content = (
      <div className="flex justify-center mt-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  } else if (disenos.length === 0) {
    content = <p className="text-slate-700">No hay diseños aprobados para mostrar.</p>;
  } else {
    const ordered = [...disenos].sort((a, b) => {
      const da = Number(a?.descargasCount || 0);
      const db = Number(b?.descargasCount || 0);
      if (db !== da) return db - da; // más descargados primero
      return String(a?.nombre || '').localeCompare(String(b?.nombre || ''));
    });
    content = (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {ordered.map((diseno) => (
          <div key={diseno.id}>
            <DisenoCard diseno={diseno} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-extrabold">Diseños electrónicos destacados</h1>
        <p className="text-sm text-slate-600">Catálogo ordenado y visual consistente — estilo e‑commerce</p>
      </div>
      {content}
    </div>
  );
};

export default HomePage;