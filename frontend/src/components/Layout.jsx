import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';

const Layout = () => {
  const auth = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-sky-600 font-extrabold tracking-wide">
            InnovCircuit
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {auth.isAuthenticated() ? (
              <>
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/dashboard" variant="ghost">Mi Panel</Button>
                )}
                {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                  <Button as={Link} to="/perfil" variant="ghost">Mi Perfil</Button>
                )}
                {auth.user?.rol === 'PROVEEDOR' && (
                  <Button as={Link} to="/subir-diseno" variant="ghost">Subir Diseño</Button>
                )}
                {auth.user?.rol === 'CLIENTE' && (
                  <Link to="/carrito" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100">
                    <ShoppingCart className="h-5 w-5 text-slate-700" />
                    {items?.length > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin" variant="ghost">Panel de Admin</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/usuarios" variant="ghost">Gestionar Usuarios</Button>
                )}
                {auth.user?.rol === 'ADMINISTRADOR' && (
                  <Button as={Link} to="/admin/configuracion" variant="ghost">Configuración</Button>
                )}
                <Button onClick={handleLogout} variant="outline">Logout</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost">Login</Button>
                <Button as={Link} to="/register" variant="default">Registro</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;