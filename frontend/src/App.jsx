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
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute allowedRoles={["PROVEEDOR"]} />}> 
          <Route path="subir-diseno" element={<SubirDisenoPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}> 
          <Route path="carrito" element={<CarritoPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App
