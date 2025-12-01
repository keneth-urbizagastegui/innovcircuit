import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, Search } from 'lucide-react';
import { Input } from './ui/input';
import Footer from './Footer';
import categoriaService from '../services/categoriaService';
import { cn } from '../utils/cn';
import Logo from '../assets/logo-compact.svg';
import FloatingChatbot from './FloatingChatbot';

const Layout = () => {
  const auth = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [term, setTerm] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [activeGroup, setActiveGroup] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    categoriaService
      .listarCategorias()
      .then((res) => setCategorias(res.data || []))
      .catch(() => setCategorias([]));
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = (term || '').trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  const handleSearch = () => {
    const q = (term || '').trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  // Detectar grupo activo desde la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const group = params.get('group') || '';
    setActiveGroup(group);
    const catParam = params.get('cat');
    setSelectedCategory(catParam ? catParam : null);
  }, [location.search]);

  const handleCategoryClick = (categoryNombre) => {
    setSelectedCategory(categoryNombre);
    const params = new URLSearchParams(location.search);
    // Actualiza solo el parámetro 'cat' y conserva los demás (q, group, etc.)
    if (categoryNombre) {
      params.set('cat', categoryNombre);
    } else {
      params.delete('cat');
    }
    const qs = params.toString();
    navigate(qs ? `/?${qs}` : '/');
  };

  const groups = [
    { label: 'Todos los productos', slug: '' },
    { label: 'Electrónica DIY', slug: 'diy-electronics' },
    { label: 'IoT y Hogar Inteligente', slug: 'iot-smart-home' },
    { label: 'Sonido', slug: 'sound' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full bg-[#0F172A] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={Logo} alt="InnovCircuit" className="h-10 w-10" />
            <span className="text-teal-300 font-bold tracking-wide text-xl whitespace-nowrap">InnovCircuit</span>
          </Link>
          {/* Buscador con fondo sólido oscuro */}
          <div className="relative flex-grow max-w-xl hidden md:block">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full rounded-lg border border-[#1E293B] bg-[#1E293B] px-4 py-2 text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button onClick={handleSearch} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-300 hover:text-teal-300 transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {auth.isAuthenticated() ? (
              <>
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/dashboard" variant="ghost" className="text-white hover:bg-teal-500/20 hover:text-teal-300 rounded-lg transition-all">Mi Panel</Button>
                )}
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/perfil" variant="ghost" className="text-white hover:bg-teal-500/20 hover:text-teal-300 rounded-lg transition-all">Mi Perfil</Button>
                )}
                {auth.user?.rol === 'PROVEEDOR' && (
                  <Button as={Link} to="/subir-diseno" variant="default" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Subir Diseño</Button>
                )}
                {auth.user?.rol === 'CLIENTE' && (
                  <Link to="/carrito" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[#2D3748]">
                    <ShoppingCart className="h-5 w-5 text-teal-300" />
                    {items?.length > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#F56565] px-1 text-xs font-bold text-white">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin" variant="ghost" className="text-white hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition-all">Panel de Admin</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/usuarios" variant="ghost" className="text-white hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition-all">Usuarios</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/configuracion" variant="ghost" className="text-white hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition-all">Config</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/retiros" variant="ghost" className="text-white hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition-all">Retiros</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/pedidos" variant="ghost" className="text-white hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition-all">Pedidos</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/reclamos" variant="ghost" className="text-white hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition-all">Reclamos</Button>
                )}
                <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all">Salir</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" className="text-white hover:bg-teal-500/20 hover:text-teal-300 rounded-lg transition-all">Iniciar sesión</Button>
                <Button as={Link} to="/register" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Registrarse</Button>
              </>
            )}
          </div>
        </div>
        {/* Navegación unificada - grupos y categorías */}
        <div className="border-t border-[#1E293B] bg-[#0F172A]">
          <nav className="mx-auto max-w-7xl px-4 py-2 text-sm text-white">
            <div className="flex items-center gap-4 whitespace-nowrap overflow-x-auto hide-scrollbar">
              {/* Grupos principales */}
              {groups.map((g) => (
                <Link
                  key={g.slug}
                  to={g.slug ? `/?group=${encodeURIComponent(g.slug)}` : '/'}
                  className={cn(
                    'whitespace-nowrap hover:text-teal-300 snap-start px-3 py-2 rounded-lg transition-all',
                    activeGroup === g.slug ? 'text-teal-300 font-semibold bg-teal-500/10' : 'text-white hover:bg-slate-700'
                  )}
                >
                  {g.label}
                </Link>
              ))}
              
              {/* Categorías */}
              {categorias.map((cat) => (
                <span
                  key={cat.id}
                  className={cn(
                    'whitespace-nowrap cursor-pointer snap-start px-3 py-2 rounded-lg transition-all',
                    selectedCategory === cat.nombre ? 'text-teal-300 font-semibold bg-teal-500/10' : 'text-white hover:bg-slate-700 hover:text-teal-300'
                  )}
                  onClick={() => handleCategoryClick(cat.nombre)}
                >
                  {cat.nombre}
                </span>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  );
};

export default Layout;
