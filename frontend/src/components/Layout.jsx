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
    { label: 'Impresión 3D y CNC', slug: '3d-printing-cnc' },
    { label: 'Equipo de cámara', slug: 'camera-equipment' },
    { label: 'IoT y Hogar Inteligente', slug: 'iot-smart-home' },
    { label: 'Robots y Drones', slug: 'robots-drones' },
    { label: 'Sonido', slug: 'sound' },
    { label: 'Suministros', slug: 'supplies' },
    { label: 'Mercado de pulgas', slug: 'flea-market' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full bg-[#1A202C] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-[#C7F782] font-extrabold tracking-wide text-2xl">
            InnovCircuit
          </Link>
          {/* Buscador con fondo sólido oscuro */}
          <div className="relative flex-grow hidden md:block">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full rounded-md border border-[#2D3748] bg-[#2D3748] px-4 py-2 text-white placeholder-[#CBD5E0] focus:border-[#48BB78] focus:outline-none focus:ring-1 focus:ring-[#48BB78]"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button onClick={handleSearch} className="absolute inset-y-0 right-0 flex items-center px-4 text-[#CBD5E0] hover:text-[#48BB78]">
              <Search className="h-5 w-5" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {auth.isAuthenticated() ? (
              <>
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/dashboard" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Mi Panel</Button>
                )}
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/perfil" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Mi Perfil</Button>
                )}
                {auth.user?.rol === 'PROVEEDOR' && (
                  <Button as={Link} to="/subir-diseno" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Subir Diseño</Button>
                )}
                {auth.user?.rol === 'CLIENTE' && (
                  <Link to="/carrito" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[#2D3748]">
                    <ShoppingCart className="h-5 w-5 text-[#C7F782]" />
                    {items?.length > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#F56565] px-1 text-xs font-bold text-white">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Panel de Admin</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/usuarios" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Gestionar Usuarios</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/configuracion" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Configuración</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/retiros" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Gestionar Retiros</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/pedidos" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Gestionar Pedidos</Button>
                )}
                <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Salir</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" className="text-white hover:bg-[#2D3748] hover:text-[#48BB78]">Iniciar sesión</Button>
                <Button as={Link} to="/register" className="bg-[#48BB78] text-white hover:bg-[#48BB78]/90">Registrarse</Button>
              </>
            )}
          </div>
        </div>
        {/* Menú superior tipo Tindie (grupos de productos) */}
        <div className="border-t border-[#2D3748] bg-[#1A202C]">
          <nav className="mx-auto max-w-7xl overflow-x-auto px-4 py-2 text-sm text-white snap-x snap-mandatory">
            <div className="flex items-center gap-4 whitespace-nowrap">
              {groups.map((g) => (
                <Link
                  key={g.slug}
                  to={g.slug ? `/?group=${encodeURIComponent(g.slug)}` : '/'}
                  className={cn(
                    'whitespace-nowrap hover:text-[#C7F782] snap-start',
                    activeGroup === g.slug ? 'text-[#48BB78] font-semibold' : 'text-white'
                  )}
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Subnavegación de categorías */}
        <div className="border-t border-[#2D3748] bg-[#1A202C]">
          <nav className="mx-auto max-w-7xl overflow-x-auto px-4 py-2 text-sm text-white snap-x snap-mandatory">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer snap-start',
                  selectedCategory === null
                    ? 'bg-[#48BB78] text-white hover:bg-[#48BB78]/80'
                    : 'bg-transparent text-white border-[#2D3748] hover:bg-[#2D3748] hover:text-[#48BB78]'
                )}
                onClick={() => handleCategoryClick(null)}
              >
                Todas
              </Badge>
              {categorias.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.nombre ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer snap-start',
                    selectedCategory === cat.nombre
                      ? 'bg-[#48BB78] text-white hover:bg-[#48BB78]/80'
                      : 'bg-transparent text-white border-[#2D3748] hover:bg-[#2D3748] hover:text-[#48BB78]'
                  )}
                  onClick={() => handleCategoryClick(cat.nombre)}
                >
                  {cat.nombre}
                </Badge>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;