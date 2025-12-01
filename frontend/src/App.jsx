import React from 'react';
import { Toaster } from 'sonner';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SubirDisenoPage from './pages/SubirDisenoPage';
import EditarDisenoPage from './pages/EditarDisenoPage';
import TransaccionesPage from './pages/TransaccionesPage';
import DisenoDetallePage from './pages/DisenoDetallePage';
import CarritoPage from './pages/CarritoPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';
import AdminConfigPage from './pages/AdminConfigPage';
import AdminRetirosPage from './pages/AdminRetirosPage';
import AdminPedidosPage from './pages/AdminPedidosPage';
import AdminReclamosPage from './pages/AdminReclamosPage';
import DashboardPage from './pages/DashboardPage';
import PerfilPage from './pages/PerfilPage';
import MisPedidosPage from './pages/MisPedidosPage';
import RetirosPage from './pages/RetirosPage';
import StorePage from './pages/StorePage';
import ReportesPage from './pages/ReportesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
      {/* Ruta Padre: Layout */}
      <Route path="/" element={<Layout />}>
        {/* Rutas Hijas */}
        <Route index element={<HomePage />} />
        <Route path="explorar" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="tienda/:id" element={<StorePage />} />
        <Route path="store/:id" element={<StorePage />} />
        {/* Ruta dinámica para página de detalle */}
        <Route path="diseno/:id" element={<DisenoDetallePage />} />
        {/* Ruta de Dashboard (Cliente y Proveedor) */}
        <Route element={<ProtectedRoute allowedRoles={["CLIENTE", "PROVEEDOR"]} />}> 
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/pedidos" element={<MisPedidosPage />} />
          {/* Perfil para CLIENTE y PROVEEDOR */}
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute allowedRoles={["PROVEEDOR"]} />}> 
          <Route path="subir-diseno" element={<SubirDisenoPage />} />
          <Route path="editar-diseno/:id" element={<EditarDisenoPage />} />
          <Route path="dashboard/transacciones" element={<TransaccionesPage />} />
          <Route path="dashboard/reportes" element={<ReportesPage />} />
          <Route path="dashboard/retiros" element={<RetirosPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}> 
          <Route path="carrito" element={<CarritoPage />} />
        </Route>
        {/* Ruta protegida para ADMINISTRADOR */}
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}> 
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
          <Route path="admin/configuracion" element={<AdminConfigPage />} />
          <Route path="admin/retiros" element={<AdminRetirosPage />} />
          <Route path="admin/pedidos" element={<AdminPedidosPage />} />
          <Route path="admin/reclamos" element={<AdminReclamosPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Routes>
    </>
  );
}

export default App
