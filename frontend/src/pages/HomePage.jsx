import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import disenoService from '../services/disenoService';
import categoriaService from '../services/categoriaService';
import DisenoCard from '../components/DisenoCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const HomePage = () => {
  // const auth = useAuth(); // Ya no es necesario para esta lógica
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true); // Empezar cargando
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

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

    // Cargar categorías
    categoriaService
      .listarCategorias()
      .then((response) => setCategorias(response.data || []))
      .catch(() => setCategorias([]));
  }, []);

  const handleSearch = () => {
    setLoading(true);
    disenoService
      .listarDisenosAprobados(keyword)
      .then((response) => {
        setDisenos(response.data);
        setError('');
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo realizar la búsqueda. Mostrando resultados existentes.');
        setLoading(false);
      });
  };

  // Permite búsqueda directa por parámetro de URL
  const handleSearchWith = (q) => {
    setLoading(true);
    disenoService
      .listarDisenosAprobados(q)
      .then((response) => {
        setDisenos(response.data);
        setError('');
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo realizar la búsqueda. Mostrando resultados existentes.');
        setLoading(false);
      });
  };

  // Sincronizar con parámetros de la URL como Tindie (q, cat, group)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const cat = params.get('cat') || '';
    const group = params.get('group') || '';
    setKeyword(q);
    setCategoriaSeleccionada(cat);
    setGrupoSeleccionado(group);
    if (q) handleSearchWith(q);
  }, [location.search]);

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
    // Filtro por categoría seleccionada
    const base = categoriaSeleccionada
      ? disenos.filter((d) => (d?.nombreCategoria || '').toLowerCase() === categoriaSeleccionada.toLowerCase())
      : disenos;

    // Filtro por grupo (simulación estilo Tindie mediante palabras clave)
    const hay = (d) => `${d?.nombreCategoria || ''} ${d?.nombre || ''}`;
    const groupFilters = {
      '': () => true,
      'diy-electronics': (d) => /arduino|esp|sensor|diy|electr[ií]c|electronic/i.test(hay(d)),
      '3d-printing-cnc': (d) => /3d|impr[eé]si[oó]n|printing|cnc/i.test(hay(d)),
      'camera-equipment': (d) => /c[aá]mara|camera|lente|lens/i.test(hay(d)),
      'iot-smart-home': (d) => /iot|smart|hogar|home/i.test(hay(d)),
      'robots-drones': (d) => /robot|drone/i.test(hay(d)),
      'sound': (d) => /audio|sonido|sound/i.test(hay(d)),
      'supplies': (d) => /suministros|supplies|componentes|parts/i.test(hay(d)),
      'flea-market': (d) => /usado|used|oferta|clearance|flea/i.test(hay(d)),
    };
    const gf = groupFilters[grupoSeleccionado] || (() => true);
    const filtrados = base.filter(gf);

    // Orden general por descargas (catálogo principal)
    const ordered = [...filtrados].sort((a, b) => {
      const da = Number(a?.descargasCount || 0);
      const db = Number(b?.descargasCount || 0);
      if (db !== da) return db - da; // más descargados primero
      return String(a?.nombre || '').localeCompare(String(b?.nombre || ''));
    });

    // Secciones estilo Tindie
    const newest = [...filtrados].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
    const popularList = filtrados.filter(d => Number(d?.descargasCount || 0) >= 25);
    content = (
      <>
        {/* Sección: Explora nuestros productos más nuevos */}
        <section className="mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Explora nuestros productos más nuevos</h2>
            <p className="text-sm text-slate-600">Encuentra cosas interesantes</p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {newest.slice(0,8).map((diseno) => (
              <div key={`new-${diseno.id}`}>
                <DisenoCard diseno={diseno} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>
              Más productos
            </Button>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mb-8 rounded-lg border bg-slate-50 p-4">
          <div className="text-center mb-3">
            <h3 className="font-semibold">Recibe novedades de hardware en tu correo</h3>
            <p className="text-sm text-slate-600">Suscríbete para descubrir nuevos diseños</p>
          </div>
          <div className="mx-auto flex max-w-md gap-2">
            <Input
              placeholder="Ingresa tu email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <Button onClick={() => {
              if (!newsletterEmail.trim()) { setNewsletterMsg('Ingresa un email válido'); return; }
              setNewsletterMsg('¡Listo! Te enviaremos novedades pronto.');
              setNewsletterEmail('');
            }}>Suscribirme</Button>
          </div>
          {newsletterMsg && (
            <div className="mt-2 text-center text-sm text-slate-700">{newsletterMsg}</div>
          )}
        </section>

        {/* Sección: Productos Populares */}
        {popularList.length > 0 && (
          <section className="mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Productos populares</h2>
              <p className="text-sm text-slate-600">Tendencias en InnovCircuit</p>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {popularList.slice(0,8).map((diseno) => (
                <div key={`pop-${diseno.id}`}>
                  <DisenoCard diseno={diseno} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Catálogo completo */}
        <section id="catalogo">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Todos los productos</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ordered.map((diseno) => (
              <div key={`all-${diseno.id}`}>
                <DisenoCard diseno={diseno} />
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Hero con buscador al estilo Tindie */}
      <div className="mb-6 rounded-lg border bg-gradient-to-r from-sky-50 to-teal-50 p-6">
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Compra cosas increíbles directamente a los makers.</h1>
          <p className="text-sm text-slate-600">Construye algo extraordinario.</p>
        </div>
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Buscar por nombre o palabra clave"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
        <div className="mx-auto mt-4 flex max-w-2xl justify-center gap-3">
          <Button variant="default" onClick={() => navigate('/subir-diseno')}>Comienza a vender</Button>
          <Button variant="outline" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Explorar productos</Button>
        </div>
        {categorias.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              variant={categoriaSeleccionada === '' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setCategoriaSeleccionada('')}
            >
              Todas
            </Badge>
            {categorias.map((cat) => (
              <Badge
                key={cat.id}
                variant={categoriaSeleccionada === cat.nombre ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setCategoriaSeleccionada(cat.nombre)}
              >
                {cat.nombre}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {content}
    </div>
  );
};

export default HomePage;