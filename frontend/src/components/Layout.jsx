import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Input } from './ui/input';
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

  // Detectar grupo activo desde la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const group = params.get('group') || '';
    setActiveGroup(group);
  }, [location.search]);

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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 w-full border-b bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-white font-extrabold tracking-wide">
            InnovCircuit
          </Link>
          {/* Buscador central como en Tindie */}
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 items-center gap-2 md:flex">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar productos"
            />
            <Button type="submit" variant="default">Buscar</Button>
          </form>
          <div className="ml-auto flex items-center gap-2">
            {auth.isAuthenticated() ? (
              <>
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/dashboard" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Mi Panel</Button>
                )}
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/perfil" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Mi Perfil</Button>
                )}
                {auth.user?.rol === 'PROVEEDOR' && (
                  <Button as={Link} to="/subir-diseno" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Subir Diseño</Button>
                )}
                {auth.user?.rol === 'CLIENTE' && (
                  <Link to="/carrito" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-700">
                    <ShoppingCart className="h-5 w-5 text-white" />
                    {items?.length > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Panel de Admin</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/usuarios" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Gestionar Usuarios</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/configuracion" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Configuración</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/retiros" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Gestionar Retiros</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/pedidos" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Gestionar Pedidos</Button>
                )}
                <Button onClick={handleLogout} variant="outline" className="border-slate-500 text-white hover:bg-slate-700 hover:text-white">Salir</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" className="text-white hover:bg-slate-700 hover:text-white">Iniciar sesión</Button>
                <Button as={Link} to="/register" variant="default">Registrarse</Button>
              </>
            )}
          </div>
        </div>
        {/* Menú superior tipo Tindie (grupos) */}
        <div className="border-t bg-white">
          <nav className="mx-auto max-w-6xl overflow-x-auto px-4 py-2 text-sm text-slate-700">
            <div className="flex items-center gap-4">
              {groups.map((g) => (
                <Link
                  key={g.slug}
                  to={g.slug ? `/?group=${encodeURIComponent(g.slug)}` : '/'}
                  className={cn(
                    'whitespace-nowrap hover:text-slate-900',
                    activeGroup === g.slug ? 'text-slate-900 font-semibold' : 'text-slate-700'
                  )}
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Subnavegación de categorías */}
        <div className="border-t bg-white">
          <nav className="mx-auto max-w-6xl overflow-x-auto px-4 py-2 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Link to="/" className="hover:text-slate-900">Todas</Link>
              {categorias.map((cat) => (
                <Link key={cat.id} to={`/?cat=${encodeURIComponent(cat.nombre)}`} className="hover:text-slate-900">
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;