import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SubirDisenoPage from './pages/SubirDisenoPage';
import DisenoDetallePage from './pages/DisenoDetallePage';
import CarritoPage from './pages/CarritoPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';
import AdminConfigPage from './pages/AdminConfigPage';
import DashboardPage from './pages/DashboardPage';
import PerfilPage from './pages/PerfilPage';

function App() {
  return (
    <Routes>
      {/* Ruta Padre: Layout */}
      <Route path="/" element={<Layout />}>
        {/* Rutas Hijas */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {/* Ruta dinámica para página de detalle */}
        <Route path="diseno/:id" element={<DisenoDetallePage />} />
        {/* Ruta de Dashboard (Cliente y Proveedor) */}
        <Route element={<ProtectedRoute allowedRoles={["CLIENTE", "PROVEEDOR"]} />}> 
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Perfil para CLIENTE y PROVEEDOR */}
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute allowedRoles={["PROVEEDOR"]} />}> 
          <Route path="subir-diseno" element={<SubirDisenoPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}> 
          <Route path="carrito" element={<CarritoPage />} />
        </Route>
        {/* Ruta protegida para ADMINISTRADOR */}
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}> 
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
          <Route path="admin/configuracion" element={<AdminConfigPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App
