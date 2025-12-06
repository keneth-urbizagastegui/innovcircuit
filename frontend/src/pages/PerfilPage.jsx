import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import usuarioService from '../services/usuarioService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';

const PerfilPage = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [descripcionTienda, setDescripcionTienda] = useState(user?.descripcionTienda || '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || '');
  const [sitioWebUrl, setSitioWebUrl] = useState(user?.sitioWebUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await usuarioService.actualizarMiPerfil({ nombre, avatarUrl, descripcionTienda, bannerUrl, sitioWebUrl });
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al actualizar el perfil.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card className="p-3">
        <CardHeader className="pb-2">
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>

        {error && (
          <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={avatarUrl} alt={nombre || 'Usuario'} />
              <div className="text-sm text-slate-700">{user?.email}</div>
            </div>
            <p className="text-xs text-slate-500">
              Personaliza cómo te verá la comunidad de InnovCircuit. Estos datos se usan en tus compras y en futuras funciones sociales.
            </p>
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <label className="text-sm font-medium text-slate-700">URL del Avatar</label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://ejemplo.com/mi-avatar.jpg"
            />
            {/* --- CAMPOS PERSONALIZADOS POR ROL --- */}
            {user?.rol === 'PROVEEDOR' ? (
              <>
                <div className="my-2 border-t border-gray-200" />
                <label className="text-sm font-medium text-slate-700">Descripción de tu Tienda</label>
                <Textarea
                  rows={4}
                  value={descripcionTienda}
                  onChange={(e) => setDescripcionTienda(e.target.value)}
                  placeholder="Describe tu tienda, quién eres y qué haces..."
                />
                <label className="text-sm font-medium text-slate-700">URL del Banner de tu Tienda</label>
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-banner.png"
                />
                <label className="text-sm font-medium text-slate-700">Sitio Web (Opcional)</label>
                <Input
                  value={sitioWebUrl}
                  onChange={(e) => setSitioWebUrl(e.target.value)}
                  placeholder="https://mi-sitio-personal.com"
                />
              </>
            ) : (
              <>
                <div className="my-2 border-t border-gray-200" />
                <label className="text-sm font-medium text-slate-700">Biografía / Sobre ti</label>
                <Textarea
                  rows={3}
                  value={descripcionTienda}
                  onChange={(e) => setDescripcionTienda(e.target.value)}
                  placeholder="Cuéntale a la comunidad quién eres y qué tipo de proyectos te interesan..."
                />
                <label className="text-sm font-medium text-slate-700">URL de tu portada (opcional)</label>
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-portada.png"
                />
                <label className="text-sm font-medium text-slate-700">Portafolio o red social (opcional)</label>
                <Input
                  value={sitioWebUrl}
                  onChange={(e) => setSitioWebUrl(e.target.value)}
                  placeholder="https://github.com/miusuario o https://instagram.com/miusuario"
                />
              </>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfilPage;