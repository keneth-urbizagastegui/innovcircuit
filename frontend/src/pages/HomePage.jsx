import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import disenoService from '../services/disenoService';
import categoriaService from '../services/categoriaService';
import DisenoCard from '../components/DisenoCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import iaService from '../services/iaService';
import IaSearchModal from '../components/IaSearchModal';

import { toast } from 'sonner';

const HomePage = () => {
  const auth = useAuth();
  const [disenos, setDisenos] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true); // Empezar cargando
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [iaSearchOpen, setIaSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar diseños al montar el componente, para todos.
    setLoading(true);
    // Cargar Destacados
    disenoService.listarDestacados()
      .then(res => setDestacados(res.data || []))
      .catch(() => setDestacados([])); // No mostrar error si falla
    disenoService
      .listarDisenosAprobados()
      .then((response) => {
        setDisenos(response.data);
        setLoading(false);
      })
      .catch(() => {
        if (import.meta.env.DEV) {
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
          setError('Mostrando catálogo de ejemplo (Modo DEV): la API no respondió.');
        } else {
          setDisenos([]);
          setError('No se pudo cargar el catálogo. Intenta nuevamente más tarde.');
        }
        setLoading(false);
      });

    // Cargar categorías
    categoriaService
      .listarCategorias()
      .then((response) => setCategorias(response.data || []))
      .catch(() => setCategorias([]));
  }, []);

  // Ejecutar búsqueda usando el servicio
  const performSearch = (searchTerm) => {
    setLoading(true);
    disenoService
      .listarDisenosAprobados(searchTerm)
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

  // Manejo del formulario del Hero
  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    const q = (keyword || '').trim();
    if (q) {
      navigate(`/?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/');
    }
  };

  // Sincronizar con parámetros de la URL como Tindie (q, cat, group)
  // Este efecto se dispara al montar Y cuando cambia la URL (location.search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const cat = params.get('cat') || '';
    const group = params.get('group') || '';
    
    // Actualizar estados locales
    setKeyword(q);
    setCategoriaSeleccionada(cat);
    setGrupoSeleccionado(group);

    // Ejecutar búsqueda siempre que cambie la URL (incluso si q está vacío, trae todos)
    performSearch(q);
    
  }, [location.search]);

  // La búsqueda asistida por IA se maneja en IaSearchModal

  const handleStartSelling = () => {
    if (!auth.isAuthenticated()) {
      toast.error("Debes iniciar sesión como proveedor para subir diseños.");
      navigate('/login');
      return;
    }
    
    if (auth.user?.rol !== 'PROVEEDOR') {
      toast.error("Esta acción es solo para proveedores.");
      // No navegar
      return;
    }

    navigate('/subir-diseno');
  };

  // Renderizado condicional (público, sin depender de auth)
  let content;
  if (loading) {
    content = (
      <div className="flex justify-center mt-12 mb-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
      </div>
    );
  } else if (error && disenos.length === 0) {
    content = (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
         <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
         </div>
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Lo sentimos</h2>
         <p className="text-slate-600">{error}</p>
         <Button 
           className="mt-6 bg-teal-500 hover:bg-teal-600 text-white"
           onClick={() => window.location.reload()}
         >
           Reintentar
         </Button>
      </div>
    );
  } else if (disenos.length === 0) {
    // Si no hay error pero la lista está vacía (ej. búsqueda sin resultados)
    content = (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No encontramos resultados</h2>
        <p className="text-slate-600">Intenta ajustar tu búsqueda o los filtros seleccionados.</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            className="bg-slate-800 hover:bg-slate-900 text-white"
            onClick={() => { setKeyword(''); setCategoriaSeleccionada(''); navigate('/'); }}
          >
            Ver todo el catálogo
          </Button>
          <Button 
            variant="outline" 
            className="border-teal-500 text-teal-600 hover:bg-teal-50"
            onClick={() => setIaSearchOpen(true)}
          >
            <span className="mr-2">✨</span> Probar búsqueda con IA
          </Button>
        </div>
      </div>
    );
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
      'iot-smart-home': (d) => /iot|smart|hogar|home/i.test(hay(d)),
      'sound': (d) => /audio|sonido|sound/i.test(hay(d)),
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
        {/* ----- INICIO NUEVA SECCIÓN: DESTACADOS ----- */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">Destacados</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Diseños seleccionados por nuestros curadores</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {destacados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {destacados.slice(0,8).map((diseno) => (
                  <div key={`feat-${diseno.id}`} className="transform transition-all duration-300 hover:scale-105">
                    <DisenoCard diseno={diseno} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Pronto destacaremos los mejores diseños para ti.
              </div>
            )}
          </div>
        </section>
        {/* Sección: Explora nuestros productos más nuevos */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Novedades</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Los productos más recientes de nuestra comunidad</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {newest.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {newest.slice(0,8).map((diseno) => (
                  <div key={`new-${diseno.id}`} className="transform transition-all duration-300 hover:scale-105">
                    <DisenoCard diseno={diseno} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Aún no hay productos nuevos para mostrar.
              </div>
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              className="rounded-xl px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
              onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver más productos
            </Button>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mx-auto max-w-4xl mb-16">
          <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">¿Quieres recibir novedades?</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">Suscríbete y te enviaremos los mejores diseños y ofertas exclusivas</p>
            <div className="mx-auto flex max-w-md gap-3">
              <Input
                placeholder="Ingresa tu email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="rounded-xl border-slate-300 bg-white"
              />
              <Button 
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 rounded-xl px-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  if (!newsletterEmail.trim()) { setNewsletterMsg('Ingresa un email válido'); return; }
                  setNewsletterMsg('¡Listo! Te enviaremos novedades pronto.');
                  setNewsletterEmail('');
                }}
              >
                Suscribirme
              </Button>
            </div>
            {newsletterMsg && (
              <div className="mt-4 text-center text-sm text-slate-700 font-medium">{newsletterMsg}</div>
            )}
          </div>
        </section>

        {/* Sección: Productos Populares */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Más Populares</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Lo que más les gusta a nuestros usuarios</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {popularList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popularList.slice(0,8).map((diseno) => (
                  <div key={`pop-${diseno.id}`} className="transform transition-all duration-300 hover:scale-105">
                    <DisenoCard diseno={diseno} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Aún no hay diseños con suficientes descargas para aparecer aquí.
              </div>
            )}
          </div>
        </section>

        {/* Catálogo completo */}
        <section id="catalogo" className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">Catálogo Completo</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Descubre todos nuestros productos ordenados por popularidad</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {ordered.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {ordered.map((diseno) => (
                  <div key={`all-${diseno.id}`} className="transform transition-all duration-300 hover:scale-105">
                    <DisenoCard diseno={diseno} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                No se encontraron productos en esta categoría.
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  return (
<div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero con diseño mejorado */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(163,230,53,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center">
          <h1 className="mb-6 text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Hardware Creativo
          </h1>
          <p className="mb-8 text-xl text-slate-300 max-w-3xl mx-auto">Descubre diseños electrónicos innovadores de makers y proveedores confiables</p>
          
          <form onSubmit={handleHeroSearchSubmit} className="mx-auto flex max-w-2xl gap-3">
            <Input
              type="text"
              placeholder="¿Qué estás buscando hoy?..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-grow rounded-xl border-slate-700 bg-slate-800/80 text-white placeholder-slate-400 focus:border-teal-400 focus:ring-teal-400 backdrop-blur-sm"
            />
            <Button type="submit" variant="default" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 rounded-xl px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Buscar
            </Button>
          </form>
          
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-4">
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 hover:from-lime-500 hover:to-emerald-500 rounded-xl px-6 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              onClick={handleStartSelling}
            >
              Comienza a vender
            </Button>
            <Button 
              variant="outline" 
              className="border-teal-400 text-teal-300 hover:bg-teal-400/10 hover:text-teal-300 rounded-xl px-6 backdrop-blur-sm"
              onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explorar productos
            </Button>
          </div>
          
          {categorias.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
              <span className="text-slate-400 text-sm">Categorías populares:</span>
              <Badge
                variant={categoriaSeleccionada === '' ? 'default' : 'secondary'}
                className="cursor-pointer rounded-full"
                onClick={() => setCategoriaSeleccionada('')}
              >
                Todas
              </Badge>
              {categorias.slice(0, 6).map((cat) => (
                <Badge
                  key={cat.id}
                  variant={categoriaSeleccionada === cat.nombre ? 'default' : 'secondary'}
                  className="cursor-pointer rounded-full"
                  onClick={() => setCategoriaSeleccionada(cat.nombre)}
                >
                  {cat.nombre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {content}
      <IaSearchModal open={iaSearchOpen} onClose={() => setIaSearchOpen(false)} />
    </div>
  );
};

export default HomePage;
