import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('CLIENTE'); // Rol por defecto
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const userData = { nombre, email, password, rol };
    try {
      const response = await authService.register(userData);
      setSuccess('¡Registro exitoso! Serás redirigido al Login.');
      // Espera 2 segundos y redirige al login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error del backend (ej: email duplicado)
      setError(err.response?.data || 'Error en el registro. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Nuevo Usuario</CardTitle>
        </CardHeader>
        {error && (
          <div className="mx-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <Input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label className="text-sm font-medium text-slate-700">Rol</label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="CLIENTE">Cliente (Quiero comprar)</option>
              <option value="PROVEEDOR">Proveedor (Quiero vender)</option>
            </select>
            <Button type="submit">Registrarse</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;